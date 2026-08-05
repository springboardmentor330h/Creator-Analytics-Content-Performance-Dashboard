"""
User service layer.

This file contains database-related user operations.
"""

from sqlalchemy.orm import Session

from app.core.security import hash_password

from app.models.user import User

from app.schemas.user import UserRegister


def create_user(
    db: Session,
    user_data: UserRegister
) -> User:
    """
    Create a new user.

    The password is hashed before saving.
    """

    # Hash the user's password.
    hashed_password = hash_password(
        user_data.password
    )

    # Create User database object.
    user = User(
        full_name=user_data.full_name,
        email=user_data.email,
        role=user_data.role,
        hashed_password=hashed_password
    )

    # Add user to session.
    db.add(user)

    # Save to database.
    db.commit()

    # Refresh object with database-generated values.
    db.refresh(user)

    return user