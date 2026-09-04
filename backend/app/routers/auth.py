from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel, EmailStr

router = APIRouter()

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserRegister(BaseModel):
    full_name: str
    email: EmailStr
    password: str
    role: str = "Creator"

@router.post("/login")
def login(credentials: UserLogin):
    if credentials.password != "password123":
        raise HTTPException(status_code=401, detail="Invalid credentials")
    return {
        "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.creatoriq_token",
        "token_type": "bearer",
        "user": {"id": 1, "full_name": "Monika Chowdary", "email": credentials.email, "role": "Creator"}
    }

@router.post("/register")
def register(data: UserRegister):
    return {
        "message": "User registered successfully",
        "user": {"id": 1, "full_name": data.full_name, "email": data.email, "role": data.role}
    }

@router.get("/me")
def get_me():
    return {"id": 1, "full_name": "Monika Chowdary", "email": "monika@example.com", "role": "Creator"}
