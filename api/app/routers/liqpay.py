import base64
import hashlib
import json

from fastapi import APIRouter, Depends, Form, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.config import settings
from app.deps import get_db
from app.models import Order

router = APIRouter(prefix="/liqpay", tags=["LiqPay"])


class PaymentRequest(BaseModel):
    order_id: int | str
    amount: float


@router.post("/create-payment")
def create_payment(body: PaymentRequest):
    if body.amount <= 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="amount must be positive",
        )

    amount = body.amount
    amount_str = str(int(amount)) if float(amount).is_integer() else str(amount)

    data_dict = {
        "version": "3",
        "public_key": settings.LIQPAY_PUBLIC_KEY,
        "action": "pay",
        "amount": amount_str,
        "currency": "UAH",
        "description": f"Замовлення #{body.order_id}",
        "order_id": str(body.order_id),
        "result_url": settings.LIQPAY_RESULT_URL,
        "server_url": settings.LIQPAY_SERVER_URL,
        "sandbox": "1",
    }

    data_json = json.dumps(data_dict)
    data_b64 = base64.b64encode(data_json.encode("utf-8")).decode("utf-8")

    sign_string = settings.LIQPAY_PRIVATE_KEY + data_b64 + settings.LIQPAY_PRIVATE_KEY
    signature = base64.b64encode(
        hashlib.sha1(sign_string.encode("utf-8")).digest()
    ).decode("utf-8")

    return {"data": data_b64, "signature": signature}


@router.post("/callback")
def liqpay_callback(
    data: str = Form(...),
    signature: str = Form(...),
    db: Session = Depends(get_db),
):
    # Verify signature
    expected_sign_string = (
        settings.LIQPAY_PRIVATE_KEY + data + settings.LIQPAY_PRIVATE_KEY
    )
    expected_signature = base64.b64encode(
        hashlib.sha1(expected_sign_string.encode("utf-8")).digest()
    ).decode("utf-8")

    if signature != expected_signature:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid signature",
        )

    # Decode data
    decoded_data = json.loads(base64.b64decode(data).decode("utf-8"))
    order_id = decoded_data.get("order_id")
    payment_status = decoded_data.get("status")

    if not order_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Missing order_id in callback data",
        )

    order = db.query(Order).filter(Order.id == int(order_id)).first()
    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Order not found",
        )

    if order.payment_status in ("paid", "failed"):
        return {"status": "ok", "message": "already processed"}

    if payment_status in ("success", "sandbox"):
        order.payment_status = "paid"
    elif payment_status == "failure":
        order.payment_status = "failed"

    db.commit()
    return {"status": "ok"}
