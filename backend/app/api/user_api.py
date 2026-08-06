from fastapi import APIRouter
from app.schemas.user_schema import User

router = APIRouter()

users = []

@router.get("/users")
def get_users():
    return users

@router.post("/users")
def create_user(user: User):
    for u in users:
        if u.id == user.id:
            return {"message": f"User with id {user.id} already exists"}
    users.append(user)
    return {
        "message": "User created successfully",
        "user": user
    }

@router.put("/users/{user_id}")
def update_user(user_id: int, updated_user: User):
    for index, u in enumerate(users):
        if u.id == user_id:
            users[index] = updated_user
            return {
                "message": f"User {user_id} updated successfully",
                "user": updated_user
            }
    return {"message": f"User {user_id} not found"}

@router.delete("/users/{user_id}")
def delete_user(user_id: int):
    for u in users:
        if u.id == user_id:
            users.remove(u)
            return {"message": f"User {user_id} deleted successfully"}
    return {"message": f"User {user_id} not found"}