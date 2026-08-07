from fastapi import APIRouter, HTTPException
from app.schemas.user_schema import UserCreate, UserUpdate

router = APIRouter()

users = []

@router.post("/users")
def create_user(user: UserCreate):
    new_user = {
        "id": len(users) + 1,
        "full_name": user.full_name,
        "email": user.email,
        "role": user.role,
    }
    users.append(new_user)

    return {
        "message": "User created successfully",
        "data": new_user,
    }

@router.get("/users")
def get_users():
 return {
    "count": len(users),
    "data": users
}

@router.get("/users/{user_id}")
def get_user(user_id: int):
    for user in users:
        if user["id"] == user_id:
           return {
               "message": "User retrieved successfully",
               "data": user
            }
    raise HTTPException(status_code=404, detail="User not found")

@router.put("/users/{user_id}")
def update_user(user_id: int, updated_user: UserUpdate):
    for user in users:
        if user["id"] == user_id:
            if updated_user.full_name is not None:
                user["full_name"] = updated_user.full_name

            if updated_user.email is not None:
                user["email"] = updated_user.email

            if updated_user.role is not None:
                user["role"] = updated_user.role

            return {
                "message": "User updated successfully",
                "data": user
            }

    raise HTTPException(status_code=404, detail="User not found")

@router.delete("/users/{user_id}")
def delete_user(user_id: int):
    for index, user in enumerate(users):
        if user["id"] == user_id:
            users.pop(index)
            return {
            "message": "User deleted successfully"
        }
    raise HTTPException(status_code=404, detail="User not found")


# 4 August 2026 #
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.models.user import User
#from app.schemas.user import UserCreate
from app.schemas.user import UserCreate, UserUpdate

from app.utils.security import hash_password
from app.core.security import hash_password
from app.core.auth import get_current_user

router = APIRouter()

# Create User
@router.post("/users")
def create_user(user: UserCreate, db: Session = Depends(get_db)):

    existing_user = db.query(User).filter(User.email == user.email).first()

    if existing_user:
        raise HTTPException(
            status_code=400,
            detail="Email already exists"
        )

    new_user = User(
        full_name=user.full_name,
        email=user.email,
        #password=user.password,
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

# Get All Users
#@router.get("/users")
#def get_users(db: Session = Depends(get_db)): commented on 5 august 2026 for below function
@router.get("/users")
def get_users(
    current_user=Depends(get_current_user),
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
  # Search Users by Role
@router.get("/users/search")
def search_users(
    role: str,
    db: Session = Depends(get_db)
):
    users = db.query(User).filter(User.role == role).all()

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

# Get User By ID
@router.get("/users/{user_id}")
def get_user(user_id: int, db: Session = Depends(get_db)):

    user = db.query(User).filter(User.id == user_id).first()

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

@router.put("/users/{user_id}")
def update_user(
    user_id: int,
    updated_user: UserUpdate,
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
        user.password = updated_user.password

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


@router.delete("/users/{user_id}")
def delete_user(
    user_id: int,
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