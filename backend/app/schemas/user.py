import uuid
from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from app.models.user import RoleEnum

class UserCreate(BaseModel):
    full_name: str
    email: EmailStr
    password: str
    role: RoleEnum = RoleEnum.creator

class UserUpdate(BaseModel):
    full_name: Optional[str] = Field(None, min_length=3)
    email: Optional[EmailStr] = None
    password: Optional[str] = Field(None, min_length=6)
    role: Optional[RoleEnum] = None

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    role: RoleEnum
    full_name: str
    id: str

class UserOut(BaseModel):
    id: uuid.UUID
    full_name: str
    role: RoleEnum
    is_active: bool

    class Config:
        from_attributes = True