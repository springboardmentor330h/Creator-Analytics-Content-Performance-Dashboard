from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.auth.security import hash_password
from app.auth.security import (
    hash_password,
    verify_password,
    create_access_token
)

from app.db.database import get_db
from app.models.user import User
from app.schemas.user import UserCreate, UserUpdate, UserResponse, UserLogin

router = APIRouter()


# CREATE USER
@router.post("/users", response_model=UserResponse)
def create_user(user: UserCreate, db: Session = Depends(get_db)):

    existing_user = db.query(User).filter(User.email == user.email).first()

    if existing_user:
        raise HTTPException(
            status_code=409,
            detail="Email already exists"
        )

    new_user = User(
        full_name=user.full_name,
        email=user.email,
        password=hash_password(user.password),
        role=user.role
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return new_user


# GET ALL USERS
@router.get("/users", response_model=list[UserResponse])
def get_users(db: Session = Depends(get_db)):

    users = db.query(User).all()

    return users


# GET USER BY ID
@router.get("/users/{user_id}", response_model=UserResponse)
def get_user(user_id: int, db: Session = Depends(get_db)):

    user = db.query(User).filter(User.id == user_id).first()

    if not user:
        raise HTTPException(
            status_code=404,
            detail="User not found"
        )

    return user


# UPDATE USER
@router.put("/users/{user_id}", response_model=UserResponse)
def update_user(
    user_id: int,
    updated_user: UserUpdate,
    db: Session = Depends(get_db)
):

    user = db.query(User).filter(User.id == user_id).first()

    if not user:
        raise HTTPException(
            status_code=404,
            detail="User not found"
        )

    if updated_user.full_name is not None:
        user.full_name = updated_user.full_name

    if updated_user.email is not None:
        user.email = updated_user.email

    if updated_user.password is not None:
        user.password = updated_user.password

    if updated_user.role is not None:
        user.role = updated_user.role

    db.commit()
    db.refresh(user)

    return user


# DELETE USER
@router.delete("/users/{user_id}")
def delete_user(user_id: int, db: Session = Depends(get_db)):

    user = db.query(User).filter(User.id == user_id).first()

    if not user:
        raise HTTPException(
            status_code=404,
            detail="User not found"
        )

    db.delete(user)
    db.commit()

    return {
        "message": "User deleted successfully"
    }
@router.post("/login")
def login_user(
    user_data: UserLogin,
    db: Session = Depends(get_db)
):
    user = db.query(User).filter(
        User.email == user_data.email
    ).first()

    if not user:
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password"
        )

    if not verify_password(
        user_data.password,
        user.password
    ):
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password"
        )

    access_token = create_access_token(
        data={
            "sub": str(user.id),
            "email": user.email,
            "role": user.role
        }
    )

    return {
        "access_token": access_token,
        "token_type": "bearer"
    }