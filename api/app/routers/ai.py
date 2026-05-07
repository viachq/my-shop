import time
import logging

import httpx
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.config import settings
from app.deps import get_db
from app.models import SiteSetting
from app.schemas import ProductAdviceRequest, ProductAdviceResponse

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/ai", tags=["ai"])

PROMPT_TEMPLATE = """Ти — експерт з електроніки та гаджетів. Продукт: "{product_name}" (категорія: {category}).

Дай коротку відповідь українською мовою:

## Про продукт
Коротко опиши цей продукт: ключові характеристики, переваги, для кого підходить (2-3 речення).

## Рекомендації щодо використання
Запропонуй 3 сценарії використання або поради щодо цього продукту. Для кожного: назва та 1 речення опису.

## Сумісні аксесуари
Порекомендуй 2-3 аксесуари або супутні товари, які добре поєднуються з цим продуктом (1 речення на кожен)."""

CACHE_TTL = 48 * 3600  # 48 hours


def get_cached(db: Session, product_name: str) -> str | None:
    key = f"ai_cache:{product_name}"
    row = db.query(SiteSetting).filter(SiteSetting.key == key).first()
    if not row:
        return None
    parts = row.value.split("\n", 1)
    if len(parts) < 2:
        return None
    try:
        ts = float(parts[0])
    except ValueError:
        return None
    if time.time() - ts > CACHE_TTL:
        db.delete(row)
        db.commit()
        return None
    return parts[1]


def set_cached(db: Session, product_name: str, advice: str) -> None:
    key = f"ai_cache:{product_name}"
    value = f"{time.time()}\n{advice}"
    row = db.query(SiteSetting).filter(SiteSetting.key == key).first()
    if row:
        row.value = value
    else:
        db.add(SiteSetting(key=key, value=value))
    db.commit()


async def call_gemini(prompt: str) -> str:
    async with httpx.AsyncClient(timeout=30) as client:
        res = await client.post(
            f"https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite-preview:generateContent?key={settings.GEMINI_API_KEY}",
            headers={"Content-Type": "application/json"},
            json={"contents": [{"parts": [{"text": prompt}]}]},
        )
        res.raise_for_status()
        data = res.json()
        return data["candidates"][0]["content"]["parts"][0]["text"]


@router.post("/product-advice")
async def product_advice(req: ProductAdviceRequest, db: Session = Depends(get_db)):
    try:
        cached = get_cached(db, req.product_name)
        if cached:
            return {"advice": cached, "success": True}
    except Exception:
        pass  # DB cache table may not exist yet

    if not settings.GEMINI_API_KEY:
        return {"advice": "API ключ не налаштовано.", "success": False}

    try:
        prompt = PROMPT_TEMPLATE.format(
            product_name=req.product_name,
            category=req.category or "не вказана",
        )
        text = await call_gemini(prompt)
        try:
            set_cached(db, req.product_name, text)
        except Exception:
            pass  # Cache write failure is non-fatal
        return {"advice": text, "success": True}
    except httpx.HTTPStatusError as e:
        logger.error("Gemini HTTP error %s: %s", e.response.status_code, e.response.text)
        return {"advice": f"Помилка Gemini API ({e.response.status_code}). Спробуйте пізніше.", "success": False}
    except Exception as e:
        logger.error("Gemini error: %s", e)
        return {"advice": "Не вдалося отримати пораду. Спробуйте пізніше.", "success": False}
