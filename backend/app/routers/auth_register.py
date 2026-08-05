from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User, RoleEnum
from app.schemas.user import UserCreate, UserUpdate, UserLogin
from app.core.security import hash_password, verify_password

router = APIRouter()


def serialize_user(user: User) -> dict:
    return {
        "id": str(user.id),
        "full_name": user.full_name,
        "email": user.email,
        "role": user.role,
        "is_active": user.is_active,
    }


@router.post("/users")
def create_user(user: UserCreate, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.email == user.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    new_user = User(
        full_name=user.full_name,
        email=user.email,
        hashed_password=hash_password(user.password),
        role=user.role,
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return serialize_user(new_user)


@router.get("/users")
def get_users(db: Session = Depends(get_db)):
    users = db.query(User).all()
    return {"count": len(users), "data": [serialize_user(u) for u in users]}


# IMPORTANT: /users/search must be defined BEFORE /users/{user_id},
# otherwise FastAPI will try to match "search" as a user_id.
@router.get("/users/search")
def search_users(role: RoleEnum, db: Session = Depends(get_db)):
    """
    GET /auth/users/search?role=creator
    Filters users by role, returns matching users and total count.
    """
    users = db.query(User).filter(User.role == role).all()
    return {
        "role": role,
        "total_count": len(users),
        "data": [serialize_user(u) for u in users],
    }


@router.get("/users/{user_id}")
def get_user(user_id: str, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return serialize_user(user)


@router.put("/users/{user_id}")
def update_user(user_id: str, updated_user: UserUpdate, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    if updated_user.email is not None:
        existing = db.query(User).filter(User.email == updated_user.email).first()
        if existing and str(existing.id) != user_id:
            raise HTTPException(status_code=400, detail="Email already exists")
        user.email = updated_user.email

    if updated_user.full_name is not None:
        user.full_name = updated_user.full_name

    if updated_user.password is not None:
        user.hashed_password = hash_password(updated_user.password)

    if updated_user.role is not None:
        user.role = updated_user.role

    db.commit()
    db.refresh(user)
    return {"message": "User updated successfully", "data": serialize_user(user)}


@router.delete("/users/{user_id}")
def delete_user(user_id: str, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    db.delete(user)
    db.commit()
    return {"message": "User deleted successfully"}


@router.post("/login")
def login(credentials: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == credentials.email).first()
    if not user or not verify_password(credentials.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    if not user.is_active:
        raise HTTPException(status_code=403, detail="Account is inactive")
    return {"message": "Login successful", "data": serialize_user(user)}