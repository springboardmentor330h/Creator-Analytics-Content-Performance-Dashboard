from pydantic import BaseModel, EmailStr,Field
from typing import Optional

class UserCreate(BaseModel):
    full_name: str = Field(..., min_length=3)
    email: EmailStr
    password: str = Field(..., min_length=6)
    role: str

class UserUpdate(BaseModel):
    full_name: Optional[str] = Field(None, min_length=3)
    email: Optional[EmailStr] = None
    password: Optional[str] = Field(None, min_length=6)
    role: Optional[str] = None