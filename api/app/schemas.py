from datetime import datetime
from decimal import Decimal
from typing import Any

from pydantic import BaseModel, EmailStr, Field


# ── Auth ──────────────────────────────────────────────────────────────
class LoginRequest(BaseModel):
    email: str
    password: str


class RegisterRequest(BaseModel):
    name: str
    email: str
    phone: str | None = None
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: "UserOut"


class UserOut(BaseModel):
    id: int
    name: str
    email: str
    phone: str | None
    role: str
    created_at: datetime

    model_config = {"from_attributes": True}


# ── Users ─────────────────────────────────────────────────────────────
class UserUpdate(BaseModel):
    name: str | None = None
    email: str | None = None
    phone: str | None = None
    role: str | None = None


class UserProfileUpdate(BaseModel):
    name: str | None = None
    email: str | None = None
    phone: str | None = None
    password: str | None = None


# ── Products ──────────────────────────────────────────────────────────
class ProductCreate(BaseModel):
    name: str
    price: Decimal
    old_price: Decimal | None = None
    img: str | None = None
    images: list[str] = []
    badge: str | None = None
    category: str
    stock: int = 0
    weight: str | None = None


class ProductUpdate(BaseModel):
    name: str | None = None
    price: Decimal | None = None
    old_price: Decimal | None = None
    img: str | None = None
    images: list[str] | None = None
    badge: str | None = None
    category: str | None = None
    stock: int | None = None
    weight: str | None = None


class ProductOut(BaseModel):
    id: int
    name: str
    price: Decimal
    old_price: Decimal | None
    img: str | None
    images: list[str]
    badge: str | None
    category: str
    stock: int
    weight: str | None
    created_at: datetime
    avg_rating: float | None = None
    review_count: int = 0

    model_config = {"from_attributes": True}


# ── Orders ────────────────────────────────────────────────────────────
class OrderItemCreate(BaseModel):
    product_name: str
    qty: int
    price: Decimal


class OrderItemOut(BaseModel):
    id: int
    product_name: str
    qty: int
    price: Decimal

    model_config = {"from_attributes": True}


class OrderCreate(BaseModel):
    name: str
    surname: str
    phone: str
    email: str
    city: str
    address: str
    comment: str | None = None
    payment_method: str
    delivery_method: str
    items: list[OrderItemCreate]
    promo_code: str | None = None


class OrderOut(BaseModel):
    id: int
    user_id: int
    status: str
    total: Decimal
    promo_code: str | None = None
    discount: Decimal | None = None
    name: str
    surname: str
    phone: str
    email: str
    city: str
    address: str
    comment: str | None
    payment_method: str
    delivery_method: str
    payment_status: str
    created_at: datetime
    items: list[OrderItemOut] = []

    model_config = {"from_attributes": True}


class OrderStatusUpdate(BaseModel):
    status: str


# ── Promo Codes ──────────────────────────────────────────────────────
class PromoCodeCreate(BaseModel):
    code: str
    discount_percent: int | None = None
    discount_amount: Decimal | None = None
    min_order: Decimal | None = Decimal("0")
    max_uses: int | None = None
    is_active: bool = True
    expires_at: datetime | None = None


class PromoCodeUpdate(BaseModel):
    code: str | None = None
    discount_percent: int | None = None
    discount_amount: Decimal | None = None
    min_order: Decimal | None = None
    max_uses: int | None = None
    is_active: bool | None = None
    expires_at: datetime | None = None


class PromoCodeOut(BaseModel):
    id: int
    code: str
    discount_percent: int | None
    discount_amount: Decimal | None
    min_order: Decimal | None
    max_uses: int | None
    used_count: int
    is_active: bool
    expires_at: datetime | None
    created_at: datetime

    model_config = {"from_attributes": True}


class PromoCodeValidateRequest(BaseModel):
    code: str
    order_total: Decimal


class PromoCodeValidateResponse(BaseModel):
    valid: bool
    discount: Decimal
    message: str


# ── Site Settings ────────────────────────────────────────────────
class SocialLinksUpdate(BaseModel):
    facebook: str = ""
    instagram: str = ""
    tiktok: str = ""
    telegram: str = ""


# ── Analytics ─────────────────────────────────────────────────────────
class AnalyticsSummary(BaseModel):
    total_revenue: Decimal
    orders_count: int
    new_customers: int
    average_check: Decimal
    top_products: list[dict[str, Any]]
    category_breakdown: list[dict[str, Any]]


# ── AI Product Advice ────────────────────────────────────────────────
class ProductAdviceRequest(BaseModel):
    product_name: str
    category: str = ""


class ProductAdviceResponse(BaseModel):
    advice: str
    success: bool
