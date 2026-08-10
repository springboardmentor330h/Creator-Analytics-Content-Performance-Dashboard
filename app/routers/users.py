from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.models.user import User
from app.schemas.user import UserCreate, UserUpdate
from app.core.security import get_password_hash


# Create API router
router = APIRouter()


# ============================================================
# CREATE USER
# ============================================================
@router.post("/users")
def create_user(
    user: UserCreate,
    db: Session = Depends(get_db)
):
    """
    Create a new user.

    The password is hashed before it is stored in the database.
    The original password is never stored or returned.
    """

    # Check whether the email already exists
    existing_user = db.query(User).filter(
        User.email == user.email
    ).first()

    if existing_user:
        raise HTTPException(
            status_code=400,
            detail="Email already exists"
        )

    # Hash the user's password
    hashed_password = get_password_hash(user.password)

    # Create new user
    new_user = User(
        full_name=user.full_name,
        email=user.email,
        password=hashed_password,
        role=user.role
    )

    # Add user to database
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    # Never return the password
    return {
        "id": new_user.id,
        "full_name": new_user.full_name,
        "email": new_user.email,
        "role": new_user.role
    }


# ============================================================
# GET ALL USERS
# ============================================================
@router.get("/users")
def get_users(
    db: Session = Depends(get_db)
):
    """
    Get all users.

    Passwords are not included in the response.
    """

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
# SEARCH USERS BY ROLE
# ============================================================
@router.get("/users/search")
def search_users_by_role(
    role: str,
    db: Session = Depends(get_db)
):
    """
    Search users by their role.

    Example:
        GET /users/search?role=admin
    """

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
# GET USER BY ID
# ============================================================
@router.get("/users/{user_id}")
def get_user(
    user_id: int,
    db: Session = Depends(get_db)
):
    """
    Get a single user using their ID.
    """

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
# UPDATE USER
# ============================================================
@router.put("/users/{user_id}")
def update_user(
    user_id: int,
    updated_user: UserUpdate,
    db: Session = Depends(get_db)
):
    """
    Update an existing user.

    If the password is changed, the new password is hashed
    before being stored in the database.
    """

    # Find user
    user = db.query(User).filter(
        User.id == user_id
    ).first()

    if not user:
        raise HTTPException(
            status_code=404,
            detail="User not found"
        )

    # --------------------------------------------------------
    # Check email uniqueness
    # --------------------------------------------------------
    if updated_user.email is not None:

        existing_user = db.query(User).filter(
            User.email == updated_user.email
        ).first()

        if existing_user and existing_user.id != user_id:
            raise HTTPException(
                status_code=400,
                detail="Email already exists"
            )

    # --------------------------------------------------------
    # Update full name
    # --------------------------------------------------------
    if updated_user.full_name is not None:
        user.full_name = updated_user.full_name

    # --------------------------------------------------------
    # Update email
    # --------------------------------------------------------
    if updated_user.email is not None:
        user.email = updated_user.email

    # --------------------------------------------------------
    # Update password
    # --------------------------------------------------------
    if updated_user.password is not None:

        # Hash the new password
        hashed_password = get_password_hash(
            updated_user.password
        )

        user.password = hashed_password

    # --------------------------------------------------------
    # Update role
    # --------------------------------------------------------
    if updated_user.role is not None:
        user.role = updated_user.role

    # Save changes
    db.commit()
    db.refresh(user)

    # Do not return the password
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
# DELETE USER
# ============================================================
@router.delete("/users/{user_id}")
def delete_user(
    user_id: int,
    db: Session = Depends(get_db)
):
    """
    Delete a user using their ID.
    """

    # Find user
    user = db.query(User).filter(
        User.id == user_id
    ).first()

    if not user:
        raise HTTPException(
            status_code=404,
            detail="User not found"
        )

    # Delete user
    db.delete(user)
    db.commit()

    return {
        "message": "User deleted successfully"
    }