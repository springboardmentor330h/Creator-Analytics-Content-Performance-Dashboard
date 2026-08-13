from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.models.user import User
from app.schemas.user import UserCreate, UserUpdate
from app.core.security import get_password_hash


# ============================================================
# CREATE API ROUTER
# ============================================================

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

    The password is hashed before it is stored
    in the database.
    """

    # Check whether email already exists
    existing_user = db.query(User).filter(
        User.email == user.email
    ).first()

    if existing_user:
        raise HTTPException(
            status_code=400,
            detail="Email already exists"
        )

    # Hash password
    hashed_password = get_password_hash(
        user.password
    )

    # Create user
    new_user = User(
        full_name=user.full_name,
        email=user.email,
        hashed_password=hashed_password,
        role=user.role
    )

    # Save to database
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return {
        "id": new_user.id,
        "full_name": new_user.full_name,
        "email": new_user.email,
        "role": new_user.role
    }


# ============================================================
# CREATE MULTIPLE USERS
# ============================================================

@router.post("/users/bulk")
def create_multiple_users(
    users: list[UserCreate],
    db: Session = Depends(get_db)
):
    """
    Create multiple users at once.

    Passwords are hashed before storing them
    in the database.
    """

    # --------------------------------------------------------
    # CHECK FOR DUPLICATE EMAILS IN DATABASE
    # --------------------------------------------------------

    for user in users:

        existing_user = db.query(User).filter(
            User.email == user.email
        ).first()

        if existing_user:
            raise HTTPException(
                status_code=400,
                detail=f"Email already exists: {user.email}"
            )

    # --------------------------------------------------------
    # CHECK FOR DUPLICATE EMAILS IN REQUEST
    # --------------------------------------------------------

    emails = [
        user.email
        for user in users
    ]

    if len(emails) != len(set(emails)):
        raise HTTPException(
            status_code=400,
            detail="Duplicate email found in request"
        )

    # --------------------------------------------------------
    # CREATE USERS
    # --------------------------------------------------------

    new_users = []

    for user in users:

        hashed_password = get_password_hash(
            user.password
        )

        new_user = User(
            full_name=user.full_name,
            email=user.email,
            hashed_password=hashed_password,
            role=user.role
        )

        db.add(new_user)

        new_users.append(new_user)

    # --------------------------------------------------------
    # SAVE ALL USERS
    # --------------------------------------------------------

    db.commit()

    result = []

    for user in new_users:

        db.refresh(user)

        result.append({
            "id": user.id,
            "full_name": user.full_name,
            "email": user.email,
            "role": user.role
        })

    return {
        "message": "Users created successfully",
        "total_users_created": len(result),
        "users": result
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
    Search users by role.

    Example:
    /users/search?role=creator
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

    If the password is changed, it is hashed
    before storing it in the database.
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
    # CHECK EMAIL UNIQUENESS
    # --------------------------------------------------------

    if updated_user.email is not None:

        existing_user = db.query(User).filter(
            User.email == updated_user.email
        ).first()

        if (
            existing_user
            and existing_user.id != user_id
        ):
            raise HTTPException(
                status_code=400,
                detail="Email already exists"
            )

    # --------------------------------------------------------
    # UPDATE FULL NAME
    # --------------------------------------------------------

    if updated_user.full_name is not None:
        user.full_name = updated_user.full_name

    # --------------------------------------------------------
    # UPDATE EMAIL
    # --------------------------------------------------------

    if updated_user.email is not None:
        user.email = updated_user.email

    # --------------------------------------------------------
    # UPDATE PASSWORD
    # --------------------------------------------------------

    if updated_user.password is not None:

        user.hashed_password = get_password_hash(
            updated_user.password
        )

    # --------------------------------------------------------
    # UPDATE ROLE
    # --------------------------------------------------------

    if updated_user.role is not None:
        user.role = updated_user.role

    # --------------------------------------------------------
    # SAVE CHANGES
    # --------------------------------------------------------

    db.commit()
    db.refresh(user)

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

    return {
        "message": "User deleted successfully"
    }