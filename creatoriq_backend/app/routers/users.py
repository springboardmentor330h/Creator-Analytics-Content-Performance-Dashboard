from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.models.user import User
from app.schemas.user import UserCreate, UserUpdate
from app.core.security import get_password_hash
from app.core.auth import get_current_user, require_admin


# ============================================================
# CREATE API ROUTER
# ============================================================

router = APIRouter()


def _is_admin(user: User) -> bool:
    return (user.role or "").lower() == "administrator"


def _require_self_or_admin(current_user: User, target_user_id: int):
    """
    Allow the request only if the caller is looking at their own
    account, or the caller is an Administrator.
    """
    if current_user.id == target_user_id or _is_admin(current_user):
        return
    raise HTTPException(
        status_code=403,
        detail="You do not have permission to access this user's data",
    )


# ============================================================
# CREATE USER  (admin only -- public signup goes through /auth/register)
# ============================================================

@router.post("/users")
def create_user(
    user: UserCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    """
    Create a new user. Restricted to Administrators.
    Regular signup should use POST /auth/register instead.

    The password is hashed before it is stored in the database.
    """

    existing_user = db.query(User).filter(
        User.email == user.email
    ).first()

    if existing_user:
        raise HTTPException(
            status_code=400,
            detail="Email already exists"
        )

    hashed_password = get_password_hash(user.password)

    new_user = User(
        full_name=user.full_name,
        email=user.email,
        hashed_password=hashed_password,
        role=user.role
    )

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
# CREATE MULTIPLE USERS  (admin only)
# ============================================================

@router.post("/users/bulk")
def create_multiple_users(
    users: list[UserCreate],
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    """
    Create multiple users at once. Restricted to Administrators.
    """

    for user in users:
        existing_user = db.query(User).filter(
            User.email == user.email
        ).first()

        if existing_user:
            raise HTTPException(
                status_code=400,
                detail=f"Email already exists: {user.email}"
            )

    emails = [user.email for user in users]

    if len(emails) != len(set(emails)):
        raise HTTPException(
            status_code=400,
            detail="Duplicate email found in request"
        )

    new_users = []

    for user in users:
        hashed_password = get_password_hash(user.password)

        new_user = User(
            full_name=user.full_name,
            email=user.email,
            hashed_password=hashed_password,
            role=user.role
        )

        db.add(new_user)
        new_users.append(new_user)

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
# GET ALL USERS  (admin only -- full directory listing)
# ============================================================

@router.get("/users")
def get_users(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    """
    Get all users. Restricted to Administrators.
    Passwords are not included in the response.
    """

    users = db.query(User).all()

    return [
        {
            "id": user.id,
            "full_name": user.full_name,
            "email": user.email,
            "role": user.role
        }
        for user in users
    ]


# ============================================================
# SEARCH USERS BY ROLE  (admin only)
# ============================================================

@router.get("/users/search")
def search_users_by_role(
    role: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    """
    Search users by role. Restricted to Administrators.

    Example:
    /users/search?role=Creator
    """

    users = db.query(User).filter(
        User.role == role
    ).all()

    result = [
        {
            "id": user.id,
            "full_name": user.full_name,
            "email": user.email,
            "role": user.role
        }
        for user in users
    ]

    return {
        "total_count": len(result),
        "users": result
    }


# ============================================================
# GET USER BY ID  (self or admin only)
# ============================================================

@router.get("/users/{user_id}")
def get_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Get a single user using their ID.
    A user may only fetch their own record unless they are an Administrator.
    """

    _require_self_or_admin(current_user, user_id)

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
# UPDATE USER  (self or admin only)
# ============================================================

@router.put("/users/{user_id}")
def update_user(
    user_id: int,
    updated_user: UserUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Update an existing user.
    A user may only update their own record unless they are an Administrator.
    Only Administrators may change a user's role.

    If the password is changed, it is hashed before storing it in the database.
    """

    _require_self_or_admin(current_user, user_id)

    user = db.query(User).filter(
        User.id == user_id
    ).first()

    if not user:
        raise HTTPException(
            status_code=404,
            detail="User not found"
        )

    if updated_user.role is not None and not _is_admin(current_user):
        raise HTTPException(
            status_code=403,
            detail="Only Administrators can change a user's role",
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

    if updated_user.full_name is not None:
        user.full_name = updated_user.full_name

    if updated_user.email is not None:
        user.email = updated_user.email

    if updated_user.password is not None:
        user.hashed_password = get_password_hash(updated_user.password)

    if updated_user.role is not None:
        user.role = updated_user.role

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
# DELETE USER  (admin only)
# ============================================================

@router.delete("/users/{user_id}")
def delete_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    """
    Delete a user using their ID. Restricted to Administrators.
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
