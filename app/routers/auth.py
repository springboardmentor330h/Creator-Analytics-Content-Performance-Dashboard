from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.models.user import User
from app.schemas.user import UserRegister, Token
from app.core.security import (
    hash_password,
    verify_password,
    create_access_token,
    get_current_user,
)

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/register")
def register(
    data: UserRegister,
    db: Session = Depends(get_db),
):
    if db.query(User).filter(User.email == data.email).first():
        raise HTTPException(400, "Email already registered")

    u = User(
        full_name=data.full_name,
        email=data.email,
        hashed_password=hash_password(data.password),
        role=data.role,
        bio=data.bio,
        is_active=True,
        is_deleted=False,
    )

    db.add(u)
    db.commit()
    db.refresh(u)

    return {
        "message": "User registered successfully",
        "user_id": str(u.id),
    }


@router.post("/login", response_model=Token)
def login(
    email: str,
    password: str,
    db: Session = Depends(get_db),
):
    u = (
        db.query(User)
        .filter(
            User.email == email,
            User.is_deleted == False,
        )
        .first()
    )

    if not u or not verify_password(
        password,
        u.hashed_password,
    ):
        raise HTTPException(
            401,
            "Invalid email or password",
        )

    return {
        "access_token": create_access_token(
            {"sub": str(u.id)}
        ),
        "token_type": "bearer",
    }


@router.get("/me")
def get_me(
    current_user: User = Depends(get_current_user),
):
    return {
        "id": str(current_user.id),
        "full_name": current_user.full_name,
        "email": current_user.email,
        "role": current_user.role,
        "bio": current_user.bio,
        "is_active": current_user.is_active,
    }