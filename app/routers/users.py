
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.models.user import User
from app.schemas.user import UserCreate, UserUpdate
from app.core.security import hash_password
from app.core.auth import get_current_user, require_roles


router = APIRouter()


# ============================================================
# Create User
# Only Administrator can create users
# ============================================================

@router.post("/users")
def create_user(
    user: UserCreate,
    current_user=Depends(require_roles("Administrator")),
    db: Session = Depends(get_db)
):
    existing_user = db.query(User).filter(
        User.email == user.email
    ).first()

    if existing_user:
        raise HTTPException(
            status_code=400,
            detail="Email already exists"
        )

    new_user = User(
        full_name=user.full_name,
        email=user.email,
        password=hash_password(user.password),
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
# Get All Users
# Only Administrator can view all users
# ============================================================

@router.get("/users")
def get_users(
    current_user=Depends(require_roles("Administrator")),
    db: Session = Depends(get_db)
):
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
# Search Users by Role
# Agency, Marketing Team and Administrator
# ============================================================

@router.get("/users/search")
def search_users(
    role: str,
    current_user=Depends(
        require_roles(
            "Agency",
            "Marketing Team",
            "Administrator"
        )
    ),
    db: Session = Depends(get_db)
):
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
# Get Current Logged-in User
# All authenticated users
# ============================================================

@router.get("/users/me")
def get_current_user_profile(
    current_user=Depends(get_current_user)
):
    return {
        "id": current_user.id,
        "full_name": current_user.full_name,
        "email": current_user.email,
        "role": current_user.role
    }


# ============================================================
# Get User By ID
#
# Creator -> Only own profile
# Agency -> Any user
# Marketing Team -> Any user
# Administrator -> Any user
# ============================================================

@router.get("/users/{user_id}")
def get_user(
    user_id: int,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Creator can access only their own profile
    if current_user.role == "Creator" and current_user.id != user_id:
        raise HTTPException(
            status_code=403,
            detail="Creators can access only their own profile"
        )

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
# Update User
#
# Creator -> Can update own profile only
# Agency -> Can update users
# Marketing Team -> Can update users
# Administrator -> Can update users
#
# Only Administrator can change roles
# ============================================================

@router.put("/users/{user_id}")
def update_user(
    user_id: int,
    updated_user: UserUpdate,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Creator can update only their own profile
    if current_user.role == "Creator" and current_user.id != user_id:
        raise HTTPException(
            status_code=403,
            detail="Creators can update only their own profile"
        )

    # Check whether user has permission to update
    allowed_roles = [
        "Creator",
        "Agency",
        "Marketing Team",
        "Administrator"
    ]

    if current_user.role not in allowed_roles:
        raise HTTPException(
            status_code=403,
            detail="You do not have permission to update users"
        )

    user = db.query(User).filter(
        User.id == user_id
    ).first()

    if not user:
        raise HTTPException(
            status_code=404,
            detail="User not found"
        )

    # Check duplicate email
    if updated_user.email is not None:
        existing_user = db.query(User).filter(
            User.email == updated_user.email
        ).first()

        if existing_user and existing_user.id != user_id:
            raise HTTPException(
                status_code=400,
                detail="Email already exists"
            )

    # Update full name
    if updated_user.full_name is not None:
        user.full_name = updated_user.full_name

    # Update email
    if updated_user.email is not None:
        user.email = updated_user.email

    # Update password
    if updated_user.password is not None:
        user.password = hash_password(
            updated_user.password
        )

    # Only Administrator can change roles
    if updated_user.role is not None:
        if current_user.role != "Administrator":
            raise HTTPException(
                status_code=403,
                detail="Only Administrator can change user roles"
            )

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
# Delete User
# Only Administrator can delete users
# ============================================================

@router.delete("/users/{user_id}")
def delete_user(
    user_id: int,
    current_user=Depends(
        require_roles("Administrator")
    ),
    db: Session = Depends(get_db)
):
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
        "message": "User Deleted Successfully"
    }

