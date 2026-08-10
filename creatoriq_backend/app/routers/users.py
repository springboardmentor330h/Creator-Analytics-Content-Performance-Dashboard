from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.auth import get_current_user, require_admin
from app.db.database import get_db
from app.models.user import User
from app.schemas.user_schema import UserCreate, UserUpdate
from app.services.user_service import (
    UserAlreadyExistsError,
    create_user as create_user_record,
    delete_user as delete_user_record,
    get_user_by_id,
    list_users,
    update_user as update_user_record,
)

router = APIRouter(tags=["users"])


def _user_response(user: User) -> dict:
    return {"id": user.id, "full_name": user.full_name, "email": user.email, "role": user.role}


@router.get("/users/search")
def search_users(
    role: str,
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
):
    users = list_users(db, role=role)
    return {"total": len(users), "users": [_user_response(user) for user in users]}


@router.post("/users", status_code=status.HTTP_201_CREATED)
def create_user(
    user: UserCreate,
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
):
    try:
        new_user = create_user_record(
            db,
            full_name=user.full_name,
            email=user.email,
            password=user.password,
            role=user.role,
        )
    except UserAlreadyExistsError:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Email already exists")
    return {"message": "User created successfully", "data": _user_response(new_user)}


@router.get("/users")
def get_users(db: Session = Depends(get_db), _: User = Depends(require_admin)):
    return [_user_response(user) for user in list_users(db)]


@router.get("/users/{user_id}")
def get_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if current_user.id != user_id and current_user.role != "Administrator":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to view this user")
    user = get_user_by_id(db, user_id)
    if user is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    return _user_response(user)


@router.put("/users/{user_id}")
def update_user(
    user_id: int,
    updated_user: UserUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if current_user.id != user_id and current_user.role != "Administrator":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to update this user")
    updates = updated_user.model_dump(exclude_unset=True)
    if updates.get("role") is not None and current_user.role != "Administrator":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Only administrators can change roles")
    user = get_user_by_id(db, user_id)
    if user is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    try:
        user = update_user_record(db, user, **updates)
    except UserAlreadyExistsError:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Email already exists")
    return {"message": "User updated successfully", "data": _user_response(user)}


@router.delete("/users/{user_id}")
def delete_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if current_user.id != user_id and current_user.role != "Administrator":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to delete this user")
    user = get_user_by_id(db, user_id)
    if user is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    delete_user_record(db, user)
    return {"message": "User deleted successfully"}
