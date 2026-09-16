from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.core.auth import get_current_user, require_roles
from app.db.database import get_db
from app.models.user import User, UserRole
from app.schemas.user import UserCreate, UserListResponse, UserResponse, UserUpdate
from app.services.user_service import UserService

router = APIRouter(prefix="/users", tags=["Users"])


@router.post("/", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def create_user(user_in: UserCreate, db: Session = Depends(get_db)):
    """Public signup endpoint — intentionally not behind auth."""
    return UserService.create(db, user_in)


@router.get("/", response_model=List[UserResponse], dependencies=[Depends(require_roles(UserRole.ADMINISTRATOR))])
def get_users(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return UserService.get_all(db, skip=skip, limit=limit)


@router.get(
    "/search",
    response_model=UserListResponse,
    dependencies=[Depends(require_roles(UserRole.ADMINISTRATOR))],
)
def search_users(
    role: Optional[UserRole] = Query(None, description="Filter users by role"),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
    db: Session = Depends(get_db),
):
    return UserService.search_by_role(db, role=role, skip=skip, limit=limit)


@router.get("/{user_id}", response_model=UserResponse)
def get_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if current_user.role != UserRole.ADMINISTRATOR and current_user.id != user_id:
        raise HTTPException(status_code=403, detail="You can only view your own profile")
    return UserService.get_by_id(db, user_id)


@router.put("/{user_id}", response_model=UserResponse)
def update_user(
    user_id: int,
    user_in: UserUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if current_user.role != UserRole.ADMINISTRATOR and current_user.id != user_id:
        raise HTTPException(status_code=403, detail="You can only update your own profile")
    return UserService.update(db, user_id, user_in)


@router.delete("/{user_id}")
def delete_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if current_user.role != UserRole.ADMINISTRATOR and current_user.id != user_id:
        raise HTTPException(status_code=403, detail="You can only delete your own account")
    return UserService.delete(db, user_id)
