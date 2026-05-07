from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.auth import hash_password
from app.deps import get_current_user, get_db, require_roles
from app.models import User, UserRole
from app.schemas import UserOut, UserProfileUpdate, UserUpdate

router = APIRouter(prefix="/users", tags=["Users"])

STAFF_ROLES = {"superadmin", "admin"}


@router.get("/", response_model=list[UserOut])
def list_users(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles("superadmin", "admin")),
):
    return db.query(User).order_by(User.created_at.desc()).all()


@router.get("/me", response_model=UserOut)
def get_my_profile(current_user: User = Depends(get_current_user)):
    return current_user


@router.put("/me", response_model=UserOut)
def update_my_profile(
    body: UserProfileUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if body.name is not None:
        current_user.name = body.name
    if body.email is not None:
        existing = db.query(User).filter(User.email == body.email, User.id != current_user.id).first()
        if existing:
            raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Email already in use")
        current_user.email = body.email
    if body.phone is not None:
        current_user.phone = body.phone
    if body.password is not None:
        current_user.password_hash = hash_password(body.password)
    db.commit()
    db.refresh(current_user)
    return current_user


@router.get("/{user_id}", response_model=UserOut)
def get_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles("superadmin", "admin")),
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    return user


def _check_permission(current_user: User, target_user: User, new_role: str | None = None):
    """Enforce role hierarchy: only superadmin can touch admin/superadmin accounts."""
    caller = current_user.role.value
    target = target_user.role.value

    if target == "superadmin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Суперадміна не можна редагувати або видалити")

    if target == "admin" and caller != "superadmin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Тільки суперадмін може керувати адміністраторами")

    if new_role and new_role in STAFF_ROLES and caller != "superadmin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Тільки суперадмін може призначати адміністраторів")


@router.put("/{user_id}", response_model=UserOut)
def update_user(
    user_id: int,
    body: UserUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles("superadmin", "admin")),
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    _check_permission(current_user, user, body.role)

    if body.name is not None:
        user.name = body.name
    if body.email is not None:
        existing = db.query(User).filter(User.email == body.email, User.id != user.id).first()
        if existing:
            raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Email already in use")
        user.email = body.email
    if body.phone is not None:
        user.phone = body.phone
    if body.role is not None:
        try:
            user.role = UserRole(body.role)
        except ValueError:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid role. Allowed: {[r.value for r in UserRole]}",
            )
    db.commit()
    db.refresh(user)
    return user


@router.delete("/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles("superadmin", "admin")),
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    if user.id == current_user.id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Cannot delete yourself")

    _check_permission(current_user, user)

    db.delete(user)
    db.commit()
