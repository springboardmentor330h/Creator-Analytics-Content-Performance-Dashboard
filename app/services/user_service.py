from typing import List, Optional
from uuid import UUID
from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.core.security import hash_password
from app.models.user import User, UserRole
from app.schemas.user import UserCreate, UserUpdate


class UserService:

    @staticmethod
    def get_by_id(db: Session, user_id: UUID) -> Optional[User]:
        return (
            db.query(User)
            .filter(
                User.id == user_id,
                User.is_deleted == False
            )
            .first()
        )

    @staticmethod
    def get_by_email(db: Session, email: str) -> Optional[User]:
        return (
            db.query(User)
            .filter(
                User.email == email,
                User.is_deleted == False
            )
            .first()
        )

    @staticmethod
    def get_all(
        db: Session,
        skip: int = 0,
        limit: int = 100
    ) -> List[User]:

        return (
            db.query(User)
            .filter(User.is_deleted == False)
            .offset(skip)
            .limit(limit)
            .all()
        )

    @staticmethod
    def create(
        db: Session,
        user_in: UserCreate
    ) -> User:

        # Check duplicate email
        existing_user = (
            db.query(User)
            .filter(User.email == user_in.email)
            .first()
        )

        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered"
            )

        # Hash password securely
        hashed_password = hash_password(user_in.password)

        db_user = User(
            full_name=user_in.full_name,
            email=user_in.email,
            hashed_password=hashed_password,
            role=user_in.role,
            bio=user_in.bio,
            is_active=True,
            is_deleted=False
        )

        db.add(db_user)
        db.commit()
        db.refresh(db_user)

        return db_user

    @staticmethod
    def update(
        db: Session,
        user_id: UUID,
        user_in: UserUpdate
    ) -> User:

        db_user = UserService.get_by_id(db, user_id)

        if not db_user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )

        update_data = user_in.model_dump(exclude_unset=True)

        # Check duplicate email
        if "email" in update_data:
            new_email = update_data["email"]

            if new_email != db_user.email:
                existing_user = (
                    db.query(User)
                    .filter(
                        User.email == new_email,
                        User.id != user_id,
                        User.is_deleted == False
                    )
                    .first()
                )

                if existing_user:
                    raise HTTPException(
                        status_code=status.HTTP_400_BAD_REQUEST,
                        detail="Email already in use"
                    )

        # Hash password if password is being updated
        if "password" in update_data:
            password = update_data.pop("password")
            update_data["hashed_password"] = hash_password(password)

        # Apply updates
        for field, value in update_data.items():
            setattr(db_user, field, value)

        db.commit()
        db.refresh(db_user)

        return db_user

    @staticmethod
    def delete(
        db: Session,
        user_id: UUID
    ) -> dict:

        db_user = UserService.get_by_id(db, user_id)

        if not db_user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )

        # Soft delete
        db_user.is_deleted = True

        db.commit()

        return {
            "message": "User deleted successfully"
        }

    @staticmethod
    def search_by_role(
        db: Session,
        role: Optional[UserRole] = None,
        skip: int = 0,
        limit: int = 100
    ):

        query = (
            db.query(User)
            .filter(User.is_deleted == False)
        )

        # Filter by role
        if role is not None:
            query = query.filter(User.role == role)

        # Count before pagination
        total = query.count()

        # Fetch users
        users = (
            query
            .offset(skip)
            .limit(limit)
            .all()
        )

        return {
            "total": total,
            "users": users
        }