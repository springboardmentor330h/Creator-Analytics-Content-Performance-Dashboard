from typing import List, Optional
from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models.user import User, UserRole
from app.schemas.user import UserCreate, UserUpdate


class UserService:

    @staticmethod
    def get_by_id(db: Session, user_id: int) -> Optional[User]:
        return db.query(User).filter(User.id == user_id, User.is_deleted == False).first()

    @staticmethod
    def get_by_email(db: Session, email: str) -> Optional[User]:
        return db.query(User).filter(User.email == email, User.is_deleted == False).first()

    @staticmethod
    def get_all(db: Session, skip: int = 0, limit: int = 100) -> List[User]:
        return db.query(User).filter(User.is_deleted == False).offset(skip).limit(limit).all()

    @staticmethod
    def create(db: Session, user_in: UserCreate) -> User:
        if UserService.get_by_email(db, user_in.email):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered",
            )
        # Standard placeholder password store
        db_user = User(
            full_name=user_in.full_name,
            email=user_in.email,
            hashed_password=f"hashed_{user_in.password}",  # Integrate passlib/bcrypt as needed
            role=user_in.role,
            bio=user_in.bio,
        )
        db.add(db_user)
        db.commit()
        db.refresh(db_user)
        return db_user

    @staticmethod
    def update(db: Session, user_id: int, user_in: UserUpdate) -> User:
        db_user = UserService.get_by_id(db, user_id)
        if not db_user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found",
            )

        if user_in.email and user_in.email != db_user.email:
            if UserService.get_by_email(db, user_in.email):
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Email already in use",
                )

        update_data = user_in.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_user, field, value)

        db.commit()
        db.refresh(db_user)
        return db_user

    @staticmethod
    def delete(db: Session, user_id: int) -> dict:
        db_user = UserService.get_by_id(db, user_id)
        if not db_user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found",
            )
        db_user.is_deleted = True
        db.commit()
        return {"message": "User deleted successfully"}
    
    @staticmethod
    def search_by_role(db: Session, role: Optional[UserRole] = None, skip: int = 0, limit: int = 100):
        query = db.query(User).filter(User.is_deleted == False)
        
        if role:
            query = query.filter(User.role == role)
            
        total = query.count()
        users = query.offset(skip).limit(limit).all()
        
        return {"total": total, "users": users}
    
    @staticmethod
    def search_by_role(
        db: Session, 
        role: Optional[UserRole] = None, 
        skip: int = 0, 
        limit: int = 100
    ):
        # Base query excluding soft-deleted users
        query = db.query(User).filter(User.is_deleted == False)

        # Filter by role if provided
        if role:
            query = query.filter(User.role == role)

        # Calculate total matching count before applying pagination
        total = query.count()

        # Fetch paginated user records
        users = query.offset(skip).limit(limit).all()

        return {"total": total, "users": users}