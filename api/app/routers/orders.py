from decimal import Decimal

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.deps import get_current_user, get_db, require_roles
from app.models import Order, OrderItem, OrderStatus, User
from app.routers.promocodes import increment_promo_usage, validate_promo
from app.schemas import OrderCreate, OrderOut, OrderStatusUpdate

router = APIRouter(prefix="/orders", tags=["Orders"])


@router.get("/", response_model=list[OrderOut])
def list_orders(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if current_user.role.value in ("superadmin", "admin", "manager"):
        orders = db.query(Order).order_by(Order.id.desc()).all()
    else:
        orders = (
            db.query(Order)
            .filter(Order.user_id == current_user.id)
            .order_by(Order.id.desc())
            .all()
        )
    return orders


@router.get("/{order_id}", response_model=OrderOut)
def get_order(
    order_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Order not found")
    # Customers can only view their own orders
    if current_user.role.value == "customer" and order.user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")
    return order


@router.post("/", response_model=OrderOut, status_code=status.HTTP_201_CREATED)
def create_order(
    body: OrderCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    total = sum(item.price * item.qty for item in body.items)
    promo_code_str = None
    discount = Decimal("0")

    if body.promo_code:
        valid, disc, message = validate_promo(db, body.promo_code, total)
        if not valid:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=message)
        promo_code_str = body.promo_code
        discount = disc
        total = total - discount

    order = Order(
        user_id=current_user.id,
        total=total,
        promo_code=promo_code_str,
        discount=discount,
        name=body.name,
        surname=body.surname,
        phone=body.phone,
        email=body.email,
        address=body.address,
        comment=body.comment,
        payment_method=body.payment_method,
        delivery_method=body.delivery_method,
    )
    db.add(order)
    db.flush()
    for item in body.items:
        db.add(
            OrderItem(
                order_id=order.id,
                product_name=item.product_name,
                qty=item.qty,
                price=item.price,
            )
        )
    if promo_code_str:
        increment_promo_usage(db, promo_code_str)
    db.commit()
    db.refresh(order)
    return order


@router.put("/{order_id}/status", response_model=OrderOut)
def update_order_status(
    order_id: int,
    body: OrderStatusUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles("superadmin", "admin", "manager")),
):
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Order not found")
    try:
        order.status = OrderStatus(body.status)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid status. Allowed: {[s.value for s in OrderStatus]}",
        )
    db.commit()
    db.refresh(order)
    return order
