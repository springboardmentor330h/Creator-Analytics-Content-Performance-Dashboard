from sqlalchemy.orm import Session
from fastapi import HTTPException
from app.models.user import User
from app.schemas.user import UserCreate, UserUpdate
from app.core.security import hash_password


def create_user(db: Session, user_data: UserCreate):
    """
    Create a new user in the database.
    """

    existing_user = db.query(User).filter(
        User.email == user_data.email
    ).first()

    if existing_user:
        raise HTTPException(
            status_code=400,
            detail="Email already exists"
        )

    new_user = User(
        full_name=user_data.full_name,
        email=user_data.email,
        hashed_password=hash_password(user_data.password),
        role=user_data.role
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return new_user


def get_all_users(db: Session):
    """
    Get all users from the database.
    """

    return db.query(User).all()


def get_user_by_id(db: Session, user_id: int):
    """
    Get a user by ID.
    """

    user = db.query(User).filter(
        User.id == user_id
    ).first()

    if not user:
        raise HTTPException(
            status_code=404,
            detail="User not found"
        )

    return user


def search_users_by_role(db: Session, role: str):
    """
    Get users filtered by role.
    """

    return db.query(User).filter(
        User.role == role
    ).all()


def update_user(
    db: Session,
    user_id: int,
    updated_user: UserUpdate
):
    """
    Update an existing user.
    """

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
                status_code=400,
                detail="Email already exists"
            )

        user.email = updated_user.email

    if updated_user.full_name is not None:
        user.full_name = updated_user.full_name

    if updated_user.password is not None:
        user.hashed_password = hash_password(updated_user.password)

    if updated_user.role is not None:
        user.role = updated_user.role

    db.commit()
    db.refresh(user)

    return user


def delete_user(db: Session, user_id: int):
    """
    Delete a user.
    """

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

    return True