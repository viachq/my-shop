from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.deps import get_db, require_roles
from app.models import SiteSetting, User
from app.schemas import SocialLinksUpdate

router = APIRouter(prefix="/settings", tags=["Settings"])

SOCIAL_KEYS = ["facebook", "instagram", "tiktok", "telegram"]

SOCIAL_DEFAULTS = {
    "facebook": "https://www.facebook.com/techbox.ua",
    "instagram": "https://www.instagram.com/techbox_ua",
    "tiktok": "https://www.tiktok.com/@techbox_ua",
    "telegram": "https://t.me/techbox_ua",
}


@router.get("/social")
def get_social_links(db: Session = Depends(get_db)):
    result = dict(SOCIAL_DEFAULTS)
    rows = db.query(SiteSetting).filter(
        SiteSetting.key.in_([f"social_{k}" for k in SOCIAL_KEYS])
    ).all()
    for row in rows:
        name = row.key.removeprefix("social_")
        if name in SOCIAL_KEYS:
            result[name] = row.value
    return result


@router.put("/social")
def update_social_links(
    body: SocialLinksUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles("superadmin", "admin")),
):
    data = body.model_dump()
    for key in SOCIAL_KEYS:
        db_key = f"social_{key}"
        existing = db.query(SiteSetting).filter(SiteSetting.key == db_key).first()
        if existing:
            existing.value = data[key]
        else:
            db.add(SiteSetting(key=db_key, value=data[key]))
    db.commit()
    return data
