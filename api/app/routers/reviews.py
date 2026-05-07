from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from app.deps import get_current_user, get_db
from app.models import Order, OrderItem, OrderStatus, Product, ProductReview, User, UserRole

router = APIRouter(prefix="/reviews", tags=["Reviews"])


class ReviewCreate(BaseModel):
    rating: int = Field(..., ge=1, le=5)
    comment: Optional[str] = None


def _serialize(review: ProductReview) -> dict:
    return {
        "id": review.id,
        "product_id": review.product_id,
        "user_id": review.user_id,
        "user_name": review.user.name if review.user else "Unknown",
        "rating": review.rating,
        "comment": review.comment,
        "created_at": review.created_at.isoformat(),
    }


def _has_ordered(db: Session, user_id: int, product_name: str) -> bool:
    return (
        db.query(OrderItem)
        .join(Order, Order.id == OrderItem.order_id)
        .filter(
            Order.user_id == user_id,
            Order.status != OrderStatus.cancelled,
            OrderItem.product_name == product_name,
        )
        .first()
    ) is not None


@router.get("/product/{product_id}")
def get_reviews(product_id: int, db: Session = Depends(get_db)):
    reviews = (
        db.query(ProductReview)
        .filter(ProductReview.product_id == product_id)
        .order_by(ProductReview.created_at.desc())
        .all()
    )
    return [_serialize(r) for r in reviews]


@router.get("/can-review/{product_id}")
def can_review(
    product_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        return {"can_review": False}
    return {"can_review": _has_ordered(db, current_user.id, product.name)}


@router.post("/product/{product_id}", status_code=status.HTTP_201_CREATED)
def create_review(
    product_id: int,
    body: ReviewCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")

    if not _has_ordered(db, current_user.id, product.name):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Відгук можна залишити лише для замовлених товарів",
        )

    existing = (
        db.query(ProductReview)
        .filter(ProductReview.product_id == product_id, ProductReview.user_id == current_user.id)
        .first()
    )
    if existing:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Ви вже залишили відгук для цього товару")

    review = ProductReview(
        product_id=product_id,
        user_id=current_user.id,
        rating=body.rating,
        comment=body.comment or None,
    )
    db.add(review)
    db.commit()
    db.refresh(review)
    return _serialize(review)


@router.delete("/{review_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_review(
    review_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    review = db.query(ProductReview).filter(ProductReview.id == review_id).first()
    if not review:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Review not found")

    is_admin = current_user.role in (UserRole.admin, UserRole.superadmin)
    if review.user_id != current_user.id and not is_admin:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized")

    db.delete(review)
    db.commit()
