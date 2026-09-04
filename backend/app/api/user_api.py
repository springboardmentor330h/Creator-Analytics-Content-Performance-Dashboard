from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.practice_user import PracticeUser
from app.schemas.user_practice import UserCreate, UserUpdate

router = APIRouter()


@router.post("/users")
def create_user(user: UserCreate, db: Session = Depends(get_db)):
    new_user = PracticeUser(
        full_name=user.full_name,
        email=user.email,
        role=user.role,
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)  # loads the auto-generated id back
    return {"message": "User created successfully", "data": new_user}


@router.get("/users")
def get_users(db: Session = Depends(get_db)):
    users = db.query(PracticeUser).all()
    return {"count": len(users), "data": users}


@router.get("/users/{user_id}")
def get_user(user_id: int, db: Session = Depends(get_db)):
    user = db.query(PracticeUser).filter(PracticeUser.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return {"message": "User retrieved successfully", "data": user}


@router.put("/users/{user_id}")
def update_user(user_id: int, updated_user: UserUpdate, db: Session = Depends(get_db)):
    user = db.query(PracticeUser).filter(PracticeUser.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if updated_user.full_name is not None:
        user.full_name = updated_user.full_name
    if updated_user.email is not None:
        user.email = updated_user.email
    if updated_user.role is not None:
        user.role = updated_user.role
    db.commit()
    db.refresh(user)
    return {"message": "User updated successfully", "data": user}


@router.delete("/users/{user_id}")
def delete_user(user_id: int, db: Session = Depends(get_db)):
    user = db.query(PracticeUser).filter(PracticeUser.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    db.delete(user)
    db.commit()
    return {"message": f"User {user_id} deleted successfully"}