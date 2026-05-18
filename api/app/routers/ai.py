import json
import time
import logging
from datetime import datetime, timezone

import httpx
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.config import settings
from app.deps import get_db
from app.models import Product
from app.schemas import ProductAdviceRequest

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/ai", tags=["ai"])

CATEGORY_SPECS = {
    "Смартфони": "дисплей (розмір, тип, частота), процесор, оперативна пам'ять, вбудована пам'ять, основна камера, фронтальна камера, акумулятор, ОС, захист (IP), SIM, бездротові технології",
    "Ноутбуки": "дисплей (розмір, роздільність, тип), процесор, оперативна пам'ять, накопичувач (SSD/HDD), відеокарта, акумулятор, ОС, порти, вага, клавіатура",
    "Планшети": "дисплей (розмір, тип, роздільність), процесор, оперативна пам'ять, вбудована пам'ять, камери, акумулятор, ОС, підтримка стилуса, підключення",
    "Навушники": "тип (вкладиші/накладні/повнорозмірні), підключення (Bluetooth версія), драйвери, частотний діапазон, ANC, час роботи, зарядка, захист (IP), кодеки",
    "Смарт-годинники": "дисплей (розмір, тип), процесор, пам'ять, акумулятор, захист (IP/ATM), датчики (пульс, SpO2, GPS), ОС, сумісність, ремінець",
    "Аксесуари": "тип, сумісність, матеріал, розміри, вага, особливості, колір, підключення",
    "Монітори": "діагональ, роздільність, тип матриці (IPS/VA/OLED), частота оновлення, час відгуку, яскравість, контрастність, порти, HDR, кріплення VESA",
    "Ігрові приставки": "процесор, графіка, оперативна пам'ять, накопичувач, роздільність, FPS, підключення, контролер, зворотна сумісність, розміри",
    "Фото та відео": "сенсор (тип, розмір, МП), об'єктив, ISO, відеозйомка (роздільність, FPS), стабілізація, дисплей, акумулятор, карти пам'яті, підключення",
    "Телевізори": "діагональ, роздільність, тип матриці (OLED/QLED/LED), частота оновлення, HDR, Smart TV (ОС), звук, порти (HDMI, USB), Wi-Fi, розміри",
}

PROMPT_TEMPLATE = """Ти — експерт з електроніки та гаджетів. Продукт: "{product_name}" (категорія: {category}).

Дай відповідь СТРОГО у форматі JSON (без markdown-обгортки, тільки чистий JSON):

{{
  "description": "Опис продукту українською мовою: ключові характеристики, переваги, для кого підходить. 3-5 речень.",
  "specs": [
    {{"label": "Назва характеристики", "value": "Значення"}},
    ...
  ]
}}

У specs включи 8-12 реальних технічних характеристик цього конкретного продукту.
Для категорії "{category}" важливо вказати: {category_specs}.
Використовуй реальні, точні дані для цього продукту. Відповідай українською."""

CACHE_TTL = 48 * 3600  # 48 hours


def get_cached(db: Session, product_name: str) -> tuple[str | None, list | None]:
    product = db.query(Product).filter(Product.name == product_name).first()
    if not product or not product.ai_description or not product.ai_generated_at:
        return None, None
    if time.time() - product.ai_generated_at.timestamp() > CACHE_TTL:
        product.ai_description = None
        product.ai_specs = None
        product.ai_generated_at = None
        db.commit()
        return None, None
    return product.ai_description, product.ai_specs


def set_cached(db: Session, product_name: str, description: str, specs: list | None) -> None:
    product = db.query(Product).filter(Product.name == product_name).first()
    if product:
        product.ai_description = description
        product.ai_specs = specs
        product.ai_generated_at = datetime.now(timezone.utc)
        db.commit()


async def call_gemini(prompt: str) -> str:
    async with httpx.AsyncClient(timeout=30) as client:
        res = await client.post(
            f"https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite:generateContent?key={settings.GEMINI_API_KEY}",
            headers={"Content-Type": "application/json"},
            json={"contents": [{"parts": [{"text": prompt}]}]},
        )
        res.raise_for_status()
        data = res.json()
        return data["candidates"][0]["content"]["parts"][0]["text"]


def parse_ai_response(text: str) -> tuple[str, list]:
    cleaned = text.strip()
    if cleaned.startswith("```"):
        cleaned = cleaned.split("\n", 1)[-1]
        if cleaned.endswith("```"):
            cleaned = cleaned[:-3].strip()

    try:
        data = json.loads(cleaned)
        description = data.get("description", "")
        specs = data.get("specs", [])
        if isinstance(specs, list) and all(isinstance(s, dict) for s in specs):
            return description, specs
        return description, []
    except (json.JSONDecodeError, KeyError):
        return text, []


@router.post("/product-advice")
async def product_advice(req: ProductAdviceRequest, db: Session = Depends(get_db)):
    try:
        cached_desc, cached_specs = get_cached(db, req.product_name)
        if cached_desc:
            return {"advice": cached_desc, "specs": cached_specs or [], "success": True}
    except Exception:
        pass

    if not settings.GEMINI_API_KEY:
        return {"advice": "API ключ не налаштовано.", "specs": [], "success": False}

    try:
        cat = req.category or "не вказана"
        cat_specs = CATEGORY_SPECS.get(cat, "основні технічні параметри, розміри, вага, підключення, особливості")
        prompt = PROMPT_TEMPLATE.format(
            product_name=req.product_name,
            category=cat,
            category_specs=cat_specs,
        )
        text = await call_gemini(prompt)
        description, specs = parse_ai_response(text)
        try:
            set_cached(db, req.product_name, description, specs)
        except Exception:
            pass
        return {"advice": description, "specs": specs, "success": True}
    except httpx.HTTPStatusError as e:
        logger.error("Gemini HTTP error %s: %s", e.response.status_code, e.response.text)
        return {"advice": f"Помилка Gemini API ({e.response.status_code}).", "specs": [], "success": False}
    except Exception as e:
        logger.error("Gemini error: %s", e)
        return {"advice": "Не вдалося отримати опис.", "specs": [], "success": False}
