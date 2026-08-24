from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models.user import User
from app.schemas.user import UserCreate, UserUpdate
from app.core.security import hash_password


class UserService:

    @staticmethod
    def create(db: Session, user_in: UserCreate):

        existing_user = db.query(User).filter(
            User.email == user_in.email
        ).first()

        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already exists"
            )

        db_user = User(
            full_name=user_in.full_name,
            email=user_in.email,
            hashed_password=hash_password(user_in.password),
            role=user_in.role
        )

        db.add(db_user)
        db.commit()
        db.refresh(db_user)

        return db_user

    @staticmethod
    def get_all(db: Session):
        return db.query(User).all()

    @staticmethod
    def get_by_id(db: Session, user_id: int):

        user = db.query(User).filter(
            User.id == user_id
        ).first()

        if not user:
            raise HTTPException(
                status_code=404,
                detail="User not found"
            )

        return user

    @staticmethod
    def update(db: Session, user_id: int, user_in: UserUpdate):

        user = UserService.get_by_id(db, user_id)

        if user_in.full_name is not None:
            user.full_name = user_in.full_name

        if user_in.email is not None:
            user.email = user_in.email

        if user_in.password is not None:
            user.hashed_password = hash_password(user_in.password)

        if user_in.role is not None:
            user.role = user_in.role

        db.commit()
        db.refresh(user)

        return user

    @staticmethod
    def delete(db: Session, user_id: int):

        user = UserService.get_by_id(db, user_id)

        db.delete(user)
        db.commit()

        return {
            "message": "User deleted successfully"
        }