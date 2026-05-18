import asyncio
from datetime import datetime, timezone

from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.auth import create_access_token, hash_password, verify_password
from app.deps import get_current_user, get_db
from app.email import generate_verification_token, send_verification_email
from app.models import User
from app.schemas import (
    LoginRequest,
    RegisterRequest,
    RegisterResponse,
    ResendVerificationRequest,
    TokenResponse,
    UserOut,
    VerifyEmailResponse,
)

router = APIRouter(prefix="/auth", tags=["Auth"])


def _send_email_background(background_tasks: BackgroundTasks, email: str, name: str, token: str) -> None:
    background_tasks.add_task(asyncio.to_thread, _send_email_sync, email, name, token)


def _send_email_sync(email: str, name: str, token: str) -> None:
    import asyncio
    asyncio.run(send_verification_email(email, name, token))


@router.post("/login", response_model=TokenResponse)
def login(body: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == body.email).first()
    if not user or not verify_password(body.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Невірний email або пароль",
        )
    if not user.is_verified:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Email не підтверджено. Перевірте вашу пошту",
        )
    token = create_access_token({"sub": str(user.id)})
    return TokenResponse(access_token=token, user=UserOut.model_validate(user))


@router.post("/register", response_model=RegisterResponse, status_code=status.HTTP_201_CREATED)
def register(body: RegisterRequest, background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.email == body.email).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Email вже зареєстровано",
        )

    verification_token, expires_at = generate_verification_token()

    user = User(
        name=body.name,
        email=body.email,
        phone=body.phone,
        password_hash=hash_password(body.password),
        is_verified=False,
        verification_token=verification_token,
        token_expires_at=expires_at,
    )
    db.add(user)
    db.commit()

    _send_email_background(background_tasks, user.email, user.name, verification_token)

    return RegisterResponse(message="Лист для підтвердження надіслано на вашу пошту")


@router.get("/verify-email", response_model=VerifyEmailResponse)
def verify_email(token: str, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.verification_token == token).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Посилання вже використане або недійсне",
        )

    if user.token_expires_at and user.token_expires_at.replace(tzinfo=timezone.utc) < datetime.now(timezone.utc):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Посилання прострочене. Запросіть нове",
        )

    user.is_verified = True
    user.verification_token = None
    user.token_expires_at = None
    db.commit()

    return VerifyEmailResponse(message="Email успішно підтверджено")


@router.post("/resend-verification", response_model=RegisterResponse)
def resend_verification(body: ResendVerificationRequest, background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == body.email).first()

    if not user or user.is_verified:
        return RegisterResponse(message="Якщо акаунт існує і не підтверджений, лист буде надіслано")

    verification_token, expires_at = generate_verification_token()
    user.verification_token = verification_token
    user.token_expires_at = expires_at
    db.commit()

    _send_email_background(background_tasks, user.email, user.name, verification_token)

    return RegisterResponse(message="Якщо акаунт існує і не підтверджений, лист буде надіслано")


@router.get("/me", response_model=UserOut)
def me(current_user: User = Depends(get_current_user)):
    return current_user
