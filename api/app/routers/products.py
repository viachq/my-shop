import httpx
from fastapi import APIRouter, Depends, HTTPException, Query, Response, status
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.deps import get_db, require_roles
from app.models import OrderItem, Product, ProductReview, User
from app.schemas import ProductCreate, ProductOut, ProductUpdate

router = APIRouter(prefix="/products", tags=["Products"])

_ALLOWED_IMG_HOSTS = ("https://img.jabko.ua/",)


@router.get("/img-proxy")
async def img_proxy(url: str = Query(...)):
    if not any(url.startswith(h) for h in _ALLOWED_IMG_HOSTS):
        raise HTTPException(status_code=403, detail="host not allowed")
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            resp = await client.get(url)
    except Exception:
        raise HTTPException(status_code=502, detail="upstream fetch failed")
    if resp.status_code != 200:
        raise HTTPException(status_code=resp.status_code, detail="upstream error")
    return Response(
        content=resp.content,
        media_type=resp.headers.get("content-type", "image/webp"),
        headers={"Cache-Control": "public, max-age=86400"},
    )


@router.get("/popularity")
def product_popularity(db: Session = Depends(get_db)):
    rows = (
        db.query(OrderItem.product_name, func.sum(OrderItem.qty).label("total"))
        .group_by(OrderItem.product_name)
        .all()
    )
    return {row.product_name: int(row.total) for row in rows}


def _rating_map(db: Session, product_ids: list[int]) -> dict[int, tuple[float, int]]:
    if not product_ids:
        return {}
    rows = (
        db.query(
            ProductReview.product_id,
            func.avg(ProductReview.rating).label("avg"),
            func.count(ProductReview.id).label("cnt"),
        )
        .filter(ProductReview.product_id.in_(product_ids))
        .group_by(ProductReview.product_id)
        .all()
    )
    return {row.product_id: (round(float(row.avg), 1), int(row.cnt)) for row in rows}


def _with_ratings(products: list[Product], rmap: dict[int, tuple[float, int]]) -> list[dict]:
    result = []
    for p in products:
        d = ProductOut.model_validate(p).model_dump()
        avg, cnt = rmap.get(p.id, (None, 0))
        d["avg_rating"] = avg
        d["review_count"] = cnt
        result.append(d)
    return result


@router.get("/")
def list_products(
    category: str | None = Query(None),
    search: str | None = Query(None),
    badge: str | None = Query(None),
    db: Session = Depends(get_db),
):
    q = db.query(Product)
    if category:
        q = q.filter(Product.category == category)
    if badge:
        q = q.filter(Product.badge == badge)
    if search:
        q = q.filter(Product.name.ilike(f"%{search}%"))
    products = q.order_by(Product.created_at.desc()).all()
    rmap = _rating_map(db, [p.id for p in products])
    return _with_ratings(products, rmap)


@router.get("/{product_id}")
def get_product(product_id: int, db: Session = Depends(get_db)):
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")
    rmap = _rating_map(db, [product.id])
    return _with_ratings([product], rmap)[0]


@router.post("/", response_model=ProductOut, status_code=status.HTTP_201_CREATED)
def create_product(
    body: ProductCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles("superadmin", "admin", "warehouse")),
):
    product = Product(**body.model_dump())
    db.add(product)
    db.commit()
    db.refresh(product)
    return product


@router.put("/{product_id}", response_model=ProductOut)
def update_product(
    product_id: int,
    body: ProductUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles("superadmin", "admin", "warehouse")),
):
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")
    for field, value in body.model_dump(exclude_unset=True).items():
        setattr(product, field, value)
    db.commit()
    db.refresh(product)
    return product


@router.delete("/{product_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_product(
    product_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles("superadmin", "admin")),
):
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")
    db.delete(product)
    db.commit()
