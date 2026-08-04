from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.models.user import User
from app.schemas.user import UserCreate, UserUpdate

router = APIRouter()


# CREATE USER
@router.post("/users")
def create_user(
    user: UserCreate,
    db: Session = Depends(get_db)
):
    existing_user = db.query(User).filter(
        User.email == user.email
    ).first()

    if existing_user:
        raise HTTPException(
            status_code=400,
            detail="Email already exists"
        )

    new_user = User(
        full_name=user.full_name,
        email=user.email,
        password=user.password,
        role=user.role
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return {
        "message": "User created successfully",
        "data": {
            "id": new_user.id,
            "full_name": new_user.full_name,
            "email": new_user.email,
            "role": new_user.role
        }
    }


# GET ALL USERS
@router.get("/users")
def get_users(db: Session = Depends(get_db)):

    users = db.query(User).all()

    result = []

    for user in users:
        result.append({
            "id": user.id,
            "full_name": user.full_name,
            "email": user.email,
            "role": user.role
        })

    return {
        "count": len(result),
        "data": result
    }


# SEARCH USERS BY ROLE
@router.get("/users/search")
def search_users(
    role: str,
    db: Session = Depends(get_db)
):

    users = db.query(User).filter(
        User.role == role
    ).all()

    result = []

    for user in users:
        result.append({
            "id": user.id,
            "full_name": user.full_name,
            "email": user.email,
            "role": user.role
        })

    return {
        "count": len(result),
        "data": result
    }


# GET USER BY ID
@router.get("/users/{user_id}")
def get_user(
    user_id: int,
    db: Session = Depends(get_db)
):

    user = db.query(User).filter(
        User.id == user_id
    ).first()

    if not user:
        raise HTTPException(
            status_code=404,
            detail="User not found"
        )

    return {
        "message": "User retrieved successfully",
        "data": {
            "id": user.id,
            "full_name": user.full_name,
            "email": user.email,
            "role": user.role
        }
    }


# UPDATE USER
@router.put("/users/{user_id}")
def update_user(
    user_id: int,
    updated_user: UserUpdate,
    db: Session = Depends(get_db)
):

    user = db.query(User).filter(
        User.id == user_id
    ).first()

    if not user:
        raise HTTPException(
            status_code=404,
            detail="User not found"
        )

    # Check if new email already belongs to another user
    if updated_user.email is not None:

        existing_user = db.query(User).filter(
            User.email == updated_user.email
        ).first()

        if existing_user and existing_user.id != user_id: # type: ignore
            raise HTTPException(
                status_code=400,
                detail="Email already exists"
            )

    if updated_user.full_name is not None:
        user.full_name = updated_user.full_name # type: ignore

    if updated_user.email is not None:
        user.email = updated_user.email # type: ignore

    if updated_user.password is not None:
        user.password = updated_user.password # type: ignore

    if updated_user.role is not None:
        user.role = updated_user.role # type: ignore

    db.commit()
    db.refresh(user)

    return {
        "message": "User updated successfully",
        "data": {
            "id": user.id,
            "full_name": user.full_name,
            "email": user.email,
            "role": user.role
        }
    }


# DELETE USER
@router.delete("/users/{user_id}")
def delete_user(
    user_id: int,
    db: Session = Depends(get_db)
):

    user = db.query(User).filter(
        User.id == user_id
    ).first()

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