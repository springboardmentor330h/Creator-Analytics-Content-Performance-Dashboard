from fastapi import APIRouter
from app.schemas.user_schema import User
router = APIRouter()
users = []
@router.post("/users")
def create_user(user: User):
    for existing_user in users:
        if existing_user.id == user.id:
            return {
                "message": "User ID already exists"
            }
    users.append(user)
    return {
        "message": "User created successfully",
        "user": user
    }
@router.get("/users")
def get_users():
    return users




