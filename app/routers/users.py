# from typing import List, Optional
# from fastapi import APIRouter, Depends, Query, status
# from sqlalchemy.orm import Session

# from app.db.database import get_db
# from app.models.user import UserRole
# from app.schemas.user import UserCreate, UserListResponse, UserResponse, UserUpdate
# from app.services.user_service import UserService

# router = APIRouter(prefix="/users", tags=["Users"])


# @router.post("/", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
# def create_user(user_in: UserCreate, db: Session = Depends(get_db)):
#     return UserService.create(db, user_in)


# @router.get("/", response_model=List[UserResponse])
# def get_users(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
#     return UserService.get_all(db, skip=skip, limit=limit)


# # 1. SEARCH ENDPOINT
# @router.get("/search", response_model=UserListResponse)
# def search_users(
#     role: Optional[UserRole] = Query(None, description="Filter users by role"),
#     skip: int = Query(0, ge=0),
#     limit: int = Query(100, ge=1, le=500),
#     db: Session = Depends(get_db)
# ):
#     return UserService.search_by_role(db, role=role, skip=skip, limit=limit)


# # 2. GET SINGLE USER ENDPOINT
# @router.get("/{user_id}", response_model=UserResponse)
# def get_user(user_id: int, db: Session = Depends(get_db)):
#     return UserService.get_by_id(db, user_id)


# @router.put("/{user_id}", response_model=UserResponse)
# def update_user(user_id: int, user_in: UserUpdate, db: Session = Depends(get_db)):
#     return UserService.update(db, user_id, user_in)


# @router.delete("/{user_id}")
# def delete_user(user_id: int, db: Session = Depends(get_db)):
#     return UserService.delete(db, user_id)

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.models.user import User
from app.schemas.user import UserCreate, UserUpdate
from app.core.security import hash_password
from app.core.auth import get_current_user

router = APIRouter()


# ============================================================
# Create User
# ============================================================

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
        password=hash_password(user.password),
        role=user.role
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return {
        "id": new_user.id,
        "full_name": new_user.full_name,
        "email": new_user.email,
        "role": new_user.role
    }


# ============================================================
# Get All Users
# ============================================================

@router.get("/users")
def get_users(
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
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


# ============================================================
# Search Users by Role
# ============================================================

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
        "total_count": len(result),
        "users": result
    }


# ============================================================
# Get Current Logged-in User
# IMPORTANT: This must come before /users/{user_id}
# ============================================================

@router.get("/users/me")
def get_current_user_profile(
    current_user=Depends(get_current_user)
):
    return {
        "id": current_user.id,
        "full_name": current_user.full_name,
        "email": current_user.email,
        "role": current_user.role
    }


# ============================================================
# Get User By ID
# ============================================================

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
        "id": user.id,
        "full_name": user.full_name,
        "email": user.email,
        "role": user.role
    }


# ============================================================
# Update User
# ============================================================

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

    # Check duplicate email
    if updated_user.email is not None:
        existing_user = db.query(User).filter(
            User.email == updated_user.email
        ).first()

        if existing_user and existing_user.id != user_id:
            raise HTTPException(
                status_code=400,
                detail="Email already exists"
            )

    if updated_user.full_name is not None:
        user.full_name = updated_user.full_name

    if updated_user.email is not None:
        user.email = updated_user.email

    # Hash password before saving
    if updated_user.password is not None:
        user.password = hash_password(
            updated_user.password
        )

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


# ============================================================
# Delete User
# ============================================================

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
        "message": "User Deleted Successfully"
    }