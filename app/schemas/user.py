from typing import Optional
from pydantic import BaseModel, EmailStr, Field


class UserBase(BaseModel):
    full_name: str = Field(..., min_length=3)
    email: EmailStr
    role: str


class UserCreate(UserBase):
    password: str = Field(..., min_length=6)


# Backward compatibility
UserRegister = UserCreate


class UserUpdate(BaseModel):
    full_name: Optional[str] = Field(None, min_length=3)
    email: Optional[EmailStr] = None
    password: Optional[str] = Field(None, min_length=6)
    role: Optional[str] = None


class UserResponse(UserBase):
    id: int

    class Config:
        from_attributes = True


class UserInDB(UserResponse):
    hashed_password: str


class Token(BaseModel):
    access_token: str
    token_type: str


class TokenData(BaseModel):
    email: Optional[str] = None