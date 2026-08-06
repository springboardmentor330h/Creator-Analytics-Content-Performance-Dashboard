from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.auth import get_current_user, require_admin
from app.core.security import hash_password
from app.db.database import get_db
from app.models.user import User
from app.schemas.user_schema import UserCreate, UserUpdate

router = APIRouter()


# -------------------------
# SEARCH USERS BY ROLE
# -------------------------

@router.get("/users/search")
def search_users(
    role: str,
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
):

    users = db.query(User).filter(User.role == role).all()

    return {
        "total": len(users),
        "users": [
            {
                "id": user.id,
                "full_name": user.full_name,
                "email": user.email,
                "role": user.role
            }
            for user in users
        ]
    }


# -------------------------
# CREATE USER
# -------------------------

@router.post("/users")
def create_user(
    user: UserCreate,
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
):

    existing_user = db.query(User).filter(
        User.email == user.email
    ).first()

    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
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

    return {
        "message": "User created successfully",
        "data": {
            "id": new_user.id,
            "full_name": new_user.full_name,
            "email": new_user.email,
            "role": new_user.role
        }
    }


# -------------------------
# GET ALL USERS
# -------------------------

@router.get("/users")
def get_users(db: Session = Depends(get_db), _: User = Depends(require_admin)):

    users = db.query(User).all()

    result = []

    for user in users:
        result.append({
            "id": user.id,
            "full_name": user.full_name,
            "email": user.email,
            "role": user.role
        })

    return result


# -------------------------
# GET USER BY ID
# -------------------------

@router.get("/users/{user_id}")
def get_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):

    if current_user.id != user_id and current_user.role != "admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to view this user")

    user = db.query(User).filter(
        User.id == user_id
    ).first()

    if not user:
        raise HTTPException(
            status_code=404,
            detail="User not found"
        )

    return {
        "id": user.id,
        "full_name": user.full_name,
        "email": user.email,
        "role": user.role
    }


# -------------------------
# UPDATE USER
# -------------------------

@router.put("/users/{user_id}")
def update_user(
    user_id: int,
    updated_user: UserUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):

    if current_user.id != user_id and current_user.role != "admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to update this user")

    if updated_user.role is not None and current_user.role != "admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Only administrators can change roles")

    user = db.query(User).filter(
        User.id == user_id
    ).first()

    if not user:
        raise HTTPException(
            status_code=404,
            detail="User not found"
        )

    if updated_user.email is not None:

        existing_user = db.query(User).filter(
            User.email == updated_user.email
        ).first()

        if existing_user and existing_user.id != user_id:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Email already exists"
            )

    if updated_user.full_name is not None:
        user.full_name = updated_user.full_name

    if updated_user.email is not None:
        user.email = updated_user.email

    if updated_user.password is not None:
        user.password = hash_password(updated_user.password)

    if updated_user.role is not None:
        user.role = updated_user.role

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


# -------------------------
# DELETE USER
# -------------------------

@router.delete("/users/{user_id}")
def delete_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):

    if current_user.id != user_id and current_user.role != "admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to delete this user")

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
