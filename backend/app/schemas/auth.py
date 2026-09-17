from pydantic import BaseModel, EmailStr, Field
from app.models.user import RoleEnum


class RegisterRequest(BaseModel):
    full_name: str = Field(..., min_length=1)
    email: EmailStr
    password: str = Field(..., min_length=6)
    role: RoleEnum = RoleEnum.creator


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"