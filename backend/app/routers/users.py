from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.models.user import User, UserRole
from app.schemas.user import UserCreate, UserUpdate, UserResponse

router = APIRouter(prefix="/users", tags=["Users"])


# CREATE USER
@router.post("/")
def create_user(user: UserCreate, db: Session = Depends(get_db)):

    existing_user = db.query(User).filter(User.email == user.email).first()

    if existing_user:
        raise HTTPException(
            status_code=400,
            detail="Email already exists"
        )

    new_user = User(
        full_name=user.full_name,
        email=user.email,
        hashed_password=user.password,
        role=user.role
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return new_user


# GET ALL USERS
@router.get("/")
def get_users(db: Session = Depends(get_db)):
    return db.query(User).all()


# SEARCH USERS BY ROLE
@router.get("/search")
def search_users(role: str, db: Session = Depends(get_db)):

    try:
        role_enum = UserRole(role)
    except ValueError:
        raise HTTPException(
            status_code=400,
            detail="Invalid role. Use: Creator, Agency, Marketing Team, Administrator"
        )

    users = db.query(User).filter(User.role == role_enum).all()

    return {
        "total_count": len(users),
        "users": users
    }


# GET USER BY ID
@router.get("/{user_id}")
def get_user(user_id: int, db: Session = Depends(get_db)):

    user = db.query(User).filter(User.id == user_id).first()

    if not user:
        raise HTTPException(
            status_code=404,
            detail="User not found"
        )

    return user


# UPDATE USER
@router.put("/{user_id}")
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

    # Email duplicate check
    if updated_user.email is not None:

        existing_user = (
            db.query(User)
            .filter(User.email == updated_user.email)
            .first()
        )

        if existing_user and existing_user.id != user_id:
            raise HTTPException(
                status_code=400,
                detail="Email already exists"
            )

        user.email = updated_user.email

    # Update full name
    if updated_user.full_name is not None:
        user.full_name = updated_user.full_name

    # Update password
    if updated_user.password is not None:
        user.hashed_password = updated_user.password

    # Update role
    if updated_user.role is not None:
        user.role = updated_user.role

    db.commit()
    db.refresh(user)

    return {
        "message": "User updated successfully",
        "data": user
    }


# DELETE USER
@router.delete("/{user_id}")
def delete_user(
    user_id: int,
    db: Session = Depends(get_db)
):

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