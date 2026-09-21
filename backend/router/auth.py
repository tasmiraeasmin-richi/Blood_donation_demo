from datetime import timedelta

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

import models
import schemas
import security
from database import get_db
from deps import get_current_user
from email_service import send_reset_email
from config import RESET_TOKEN_EXPIRE_MINUTES
from security import hash_password, verify_password, create_access_token
from serializers import user_to_out

router = APIRouter(tags=["Auth"])


@router.post("/createuser", response_model=schemas.UserOut, status_code=status.HTTP_201_CREATED)
def create_user(payload: schemas.UserCreate, db: Session = Depends(get_db)):
    existing_user = db.query(models.User).filter(models.User.email == payload.email).first()
    if existing_user:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email already registered")

    new_user = models.User(
        name=payload.name,
        email=payload.email,
        phone=payload.phone,
        hash_password=hash_password(payload.password),
        role="member",
        blood_group=payload.blood_group,
        district=payload.district,
        is_available=True,
        status="active",
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return user_to_out(new_user)


@router.post("/login", response_model=schemas.Token)
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.email == form_data.username).first()

    if not user or not verify_password(form_data.password, user.hash_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    if user.status == "blocked":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="This account has been blocked",
        )

    access_token = create_access_token(data={"sub": user.email})
    return schemas.Token(access_token=access_token)


@router.get("/user", response_model=schemas.UserOut)
def get_my_profile(current_user: models.User = Depends(get_current_user)):
    return user_to_out(current_user)


@router.put("/edituser", response_model=schemas.UserOut)
def edit_user(
    payload: schemas.UserUpdate,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    update_data = payload.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(current_user, field, value)

    db.commit()
    db.refresh(current_user)
    return user_to_out(current_user)


@router.put("/passwordchange")
def change_password(
    payload: schemas.PasswordChange,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if not verify_password(payload.current_password, current_user.hash_password):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Current password is incorrect")

    current_user.hash_password = hash_password(payload.new_password)
    db.commit()

    return {"detail": "Password updated successfully"}


@router.post("/forgot-password")
def forgot_password(payload: schemas.ForgotPasswordRequest, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.email == payload.email).first()

    if user:
        raw_token = security.generate_reset_token()
        user.reset_token = security.hash_reset_token(raw_token)
        user.reset_token_expiry = security.utcnow_naive() + timedelta(minutes=RESET_TOKEN_EXPIRE_MINUTES)
        db.commit()
        send_reset_email(user.email, raw_token)

    return {"detail": "If that email is registered, a password reset link has been sent."}


@router.post("/reset-password/{token}")
def reset_password(token: str, payload: schemas.ResetPasswordRequest, db: Session = Depends(get_db)):
    hashed_token = security.hash_reset_token(token)
    user = db.query(models.User).filter(models.User.reset_token == hashed_token).first()

    if not user or not user.reset_token_expiry or user.reset_token_expiry < security.utcnow_naive():
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid or expired reset token")

    user.hash_password = security.hash_password(payload.new_password)
    user.reset_token = None
    user.reset_token_expiry = None
    db.commit()

    return {"detail": "Password has been reset successfully."}
