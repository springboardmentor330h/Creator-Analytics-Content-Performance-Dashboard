from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.schemas.user import UserCreate, UserUpdate
from app.services.user_service import (
    create_user,
    get_all_users,
    get_user_by_id,
    search_users_by_role,
    update_user,
    delete_user,
)

router = APIRouter()


# CREATE USER
@router.post("/users")
def create_user_route(
    user: UserCreate,
    db: Session = Depends(get_db)
):
    new_user = create_user(db, user)

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
def get_users(
    db: Session = Depends(get_db)
):
    users = get_all_users(db)

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
    users = search_users_by_role(db, role)

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
    user = get_user_by_id(db, user_id)

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
def update_user_route(
    user_id: int,
    updated_user: UserUpdate,
    db: Session = Depends(get_db)
):
    user = update_user(db, user_id, updated_user)

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
def delete_user_route(
    user_id: int,
    db: Session = Depends(get_db)
):
    delete_user(db, user_id)

    return {
        "message": "User deleted successfully"
    }