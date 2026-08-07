from typing import Optional
from pydantic import BaseModel, EmailStr


class UserBase(BaseModel):
    """Base schema containing shared user attributes."""
    username: str
    email: EmailStr


class UserCreate(UserBase):
    """Schema for creating/registering a new user."""
    password: str


# Alias for backward compatibility if code uses UserRegister
UserRegister = UserCreate


class UserUpdate(BaseModel):
    """Schema for updating user details (all fields optional)."""
    username: Optional[str] = None
    email: Optional[EmailStr] = None
    password: Optional[str] = None


class UserResponse(UserBase):
    """Schema for returning user data (excludes sensitive info)."""
    
    class Config:
        from_attributes = True  # Supports ORM models (FastAPI v2 / Pydantic v2)


class UserInDB(UserBase):
    """Internal schema representing user in database with hashed password."""
    hashed_password: str


class Token(BaseModel):
    """Schema for JWT token response."""
    access_token: str
    token_type: str


class TokenData(BaseModel):
    """Schema for data stored within JWT token."""
    username: Optional[str] = None