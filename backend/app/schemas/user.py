from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from enum import Enum


# ✅ Role Enum (match your model)
class UserRole(str, Enum):
    CREATOR = "Creator"
    AGENCY = "Agency"
    MARKETING_TEAM = "Marketing Team"
    ADMINISTRATOR = "Administrator"


# 👉 BASE
class UserBase(BaseModel):
    full_name: str = Field(..., min_length=3)
    email: EmailStr
    role: UserRole


# 👉 CREATE
class UserCreate(UserBase):
    password: str = Field(..., min_length=6)


# 👉 UPDATE
class UserUpdate(BaseModel):
    full_name: Optional[str] = Field(None, min_length=3)
    email: Optional[EmailStr] = None
    password: Optional[str] = Field(None, min_length=6)
    role: Optional[UserRole] = None


# 👉 RESPONSE
class UserResponse(UserBase):
    id: int

    class Config:
        from_attributes = True


# 👉 TOKEN (for login)
class Token(BaseModel):
    access_token: str
    token_type: str


class TokenData(BaseModel):
    email: Optional[str] = None