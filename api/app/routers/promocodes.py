from datetime import datetime, timezone
from decimal import Decimal

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.deps import get_db, require_roles
from app.models import PromoCode, User
from app.schemas import (
    PromoCodeCreate,
    PromoCodeOut,
    PromoCodeUpdate,
    PromoCodeValidateRequest,
    PromoCodeValidateResponse,
)

router = APIRouter(prefix="/promocodes", tags=["Promo Codes"])


# ── Helper ────────────────────────────────────────────────────────────
def validate_promo(db: Session, code: str, order_total: Decimal) -> tuple[bool, Decimal, str]:
    """Validate a promo code and return (valid, discount, message)."""
    promo = db.query(PromoCode).filter(PromoCode.code == code).first()
    if not promo:
        return False, Decimal("0"), "Промокод не знайдено"
    if not promo.is_active:
        return False, Decimal("0"), "Промокод неактивний"
    if promo.expires_at and promo.expires_at < datetime.now(timezone.utc):
        return False, Decimal("0"), "Термін дії промокоду закінчився"
    if promo.max_uses is not None and promo.used_count >= promo.max_uses:
        return False, Decimal("0"), "Промокод вичерпано"
    min_order = promo.min_order or Decimal("0")
    if order_total < min_order:
        return False, Decimal("0"), f"Мінімальна сума замовлення для цього промокоду: {min_order} грн"

    if promo.discount_percent:
        discount = (order_total * promo.discount_percent / 100).quantize(Decimal("0.01"))
        message = f"Знижка {promo.discount_percent}% застосована"
    elif promo.discount_amount:
        discount = min(promo.discount_amount, order_total)
        message = f"Знижка {promo.discount_amount} грн застосована"
    else:
        return False, Decimal("0"), "Промокод налаштовано некоректно"

    return True, discount, message


def increment_promo_usage(db: Session, code: str) -> None:
    """Increment used_count for a promo code."""
    promo = db.query(PromoCode).filter(PromoCode.code == code).first()
    if promo:
        promo.used_count += 1


# ── Public endpoint ───────────────────────────────────────────────────
@router.post("/validate", response_model=PromoCodeValidateResponse)
def validate_promo_code(
    body: PromoCodeValidateRequest,
    db: Session = Depends(get_db),
):
    valid, discount, message = validate_promo(db, body.code, body.order_total)
    return PromoCodeValidateResponse(valid=valid, discount=discount, message=message)


# ── Admin CRUD ────────────────────────────────────────────────────────
@router.get("/", response_model=list[PromoCodeOut])
def list_promo_codes(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles("superadmin", "admin")),
):
    return db.query(PromoCode).order_by(PromoCode.created_at.desc()).all()


@router.post("/", response_model=PromoCodeOut, status_code=status.HTTP_201_CREATED)
def create_promo_code(
    body: PromoCodeCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles("superadmin", "admin")),
):
    if body.discount_percent and body.discount_amount:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Вкажіть або відсоток знижки, або фіксовану суму, але не обидва",
        )
    if not body.discount_percent and not body.discount_amount:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Вкажіть відсоток знижки або фіксовану суму",
        )
    existing = db.query(PromoCode).filter(PromoCode.code == body.code).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Промокод з таким кодом вже існує",
        )
    promo = PromoCode(**body.model_dump())
    db.add(promo)
    db.commit()
    db.refresh(promo)
    return promo


@router.put("/{promo_id}", response_model=PromoCodeOut)
def update_promo_code(
    promo_id: int,
    body: PromoCodeUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles("superadmin", "admin")),
):
    promo = db.query(PromoCode).filter(PromoCode.id == promo_id).first()
    if not promo:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Промокод не знайдено")
    data = body.model_dump(exclude_unset=True)
    # Validate that both discount types aren't set simultaneously
    new_percent = data.get("discount_percent", promo.discount_percent)
    new_amount = data.get("discount_amount", promo.discount_amount)
    if new_percent and new_amount:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Вкажіть або відсоток знижки, або фіксовану суму, але не обидва",
        )
    for field, value in data.items():
        setattr(promo, field, value)
    db.commit()
    db.refresh(promo)
    return promo


@router.delete("/{promo_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_promo_code(
    promo_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles("superadmin", "admin")),
):
    promo = db.query(PromoCode).filter(PromoCode.id == promo_id).first()
    if not promo:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Промокод не знайдено")
    db.delete(promo)
    db.commit()
