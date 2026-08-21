from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict, EmailStr, Field

from app.models.user import UserRole


class UserBase(BaseModel):
    """Base schema containing shared user attributes."""
    email: EmailStr
    full_name: str = Field(..., max_length=100)
    role: UserRole = UserRole.CREATOR
    bio: Optional[str] = Field(None, max_length=500)


class UserCreate(UserBase):
    """Schema for creating/registering a new user."""
    password: str = Field(..., min_length=8)


# Alias for backward compatibility
UserRegister = UserCreate


class UserUpdate(BaseModel):
    """Schema for updating user details (all fields optional)."""
    email: Optional[EmailStr] = None
    full_name: Optional[str] = Field(None, max_length=100)
    role: Optional[UserRole] = None
    bio: Optional[str] = Field(None, max_length=500)
    password: Optional[str] = Field(None, min_length=8)


class UserResponse(UserBase):
    """Schema for returning user data (excludes sensitive info)."""
    id: int
    is_active: bool
    created_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)


class UserInDB(UserBase):
    """Internal schema representing user in database with hashed password."""
    id: int
    hashed_password: str

    model_config = ConfigDict(from_attributes=True)


class Token(BaseModel):
    """Schema for JWT token response."""
    access_token: str
    token_type: str = "bearer"


class TokenData(BaseModel):
    """Schema for data stored within JWT token."""
    user_id: Optional[int] = None
    email: Optional[str] = None

class UserListResponse(BaseModel):
    items: list[UserResponse]
    total: int
    skip: int
    limit: int


# Update __all__ if present at the bottom of the file
__all__ = [
    "UserBase",
    "UserCreate",
    "UserUpdate",
    "UserResponse",
    "UserListResponse",
    "Token",
    "TokenData",
]