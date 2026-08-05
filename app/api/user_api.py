from fastapi import APIRouter
from app.schemas.user_schema import User

router = APIRouter()

# Temporary storage
users = []


# Health API
@router.get("/health")
def health():
    return {"status": "healthy"}


# GET All Users
@router.get("/users")
def get_users():
    return users


# GET User by ID
@router.get("/users/{user_id}")
def get_user(user_id: int):
    for user in users:
        if user.id == user_id:
            return user
    return {"message": "User not found"}


# POST User
@router.post("/users")
def create_user(user: User):

    # Check for duplicate ID
    for existing_user in users:
        if existing_user.id == user.id:
            return {"message": "User ID already exists"}

    users.append(user)

    return {
        "message": "User created successfully",
        "user": user
    }


# PUT User
@router.put("/users/{user_id}")
def update_user(user_id: int, updated_user: User):
    for index, user in enumerate(users):
        if user.id == user_id:
            users[index] = updated_user
            return {
                "message": "User updated successfully",
                "user": updated_user
            }

    return {"message": "User not found"}


# DELETE User
@router.delete("/users/{user_id}")
def delete_user(user_id: int):
    for user in users:
        if user.id == user_id:
            users.remove(user)
            return {"message": "User deleted successfully"}

    return {"message": "User not found"}