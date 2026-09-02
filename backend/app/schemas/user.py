"""
Pydantic schemas.

WHY separate from models/user.py?
- models/user.py (SQLAlchemy) describes the DATABASE table.
- schemas/user.py (Pydantic) describes what goes IN and OUT of the API.
These are deliberately different: e.g. we NEVER want password_hash to
leave the API in a response, even though it's a real DB column.
"""
import uuid
from datetime import datetime
from typing import Optional

from pydantic import BaseModel, EmailStr, Field

from app.models.user import UserRole


class UserCreate(BaseModel):
    name: str = Field(..., min_length=2, max_length=120)
    email: EmailStr
    password: str = Field(..., min_length=6)
    role: Optional[UserRole] = UserRole.creator


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserResponse(BaseModel):
    id: uuid.UUID
    name: str
    email: EmailStr
    role: UserRole
    created_at: datetime

    class Config:
        # Lets Pydantic read data straight off a SQLAlchemy object
        # (model.name) instead of requiring a dict (model["name"]).
        from_attributes = True


class UserUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=2, max_length=120)
    email: Optional[EmailStr] = None


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


class TokenData(BaseModel):
    user_id: Optional[str] = None
