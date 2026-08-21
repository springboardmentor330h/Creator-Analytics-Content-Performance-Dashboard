from typing import List, Optional
from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.core.security import hash_password
from app.models.user import User, UserRole
from app.schemas.user import UserCreate, UserUpdate


class UserService:
    @staticmethod
    def create(db: Session, user_in: UserCreate) -> User:
        """Creates a new user in PostgreSQL with a hashed password."""
        # Check if user already exists
        existing_user = db.query(User).filter(User.email == user_in.email).first()
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="A user with this email already exists.",
            )

        db_user = User(
            email=user_in.email,
            full_name=user_in.full_name,
            hashed_password=hash_password(user_in.password),
            role=user_in.role,
        )
        db.add(db_user)
        db.commit()
        db.refresh(db_user)
        return db_user

    @staticmethod
    def get_by_id(db: Session, user_id: int) -> User:
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"User with ID {user_id} not found",
            )
        return user

    @staticmethod
    def get_all(db: Session, skip: int = 0, limit: int = 100) -> List[User]:
        return db.query(User).offset(skip).limit(limit).all()

    @staticmethod
    def search_by_role(
        db: Session, role: Optional[UserRole] = None, skip: int = 0, limit: int = 100
    ):
        query = db.query(User)
        if role:
            query = query.filter(User.role == role)
        
        total = query.count()
        users = query.offset(skip).limit(limit).all()
        return {"items": users, "total": total, "skip": skip, "limit": limit}

    @staticmethod
    def update(db: Session, user_id: int, user_in: UserUpdate) -> User:
        user = UserService.get_by_id(db, user_id)
        update_data = user_in.model_dump(exclude_unset=True)
        
        if "password" in update_data and update_data["password"]:
            update_data["hashed_password"] = hash_password(update_data.pop("password"))

        for field, value in update_data.items():
            setattr(user, field, value)

        db.commit()
        db.refresh(user)
        return user

    @staticmethod
    def delete(db: Session, user_id: int) -> None:
        user = UserService.get_by_id(db, user_id)
        db.delete(user)
        db.commit()