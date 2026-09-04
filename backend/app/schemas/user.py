import uuid
from pydantic import BaseModel
from app.models.user import RoleEnum

class UserOut(BaseModel):
    id: uuid.UUID
    full_name: str
    role: RoleEnum
    is_active: bool

    class Config:
        from_attributes = True


# from pydantic import BaseModel, EmailStr
# from typing import Optional
# class UserCreate(BaseModel):
# full_name: str
# email: EmailStr
# role: str
# class UserUpdate(BaseModel):
# full_name: Optional[str] = None
# email: Optional[EmailStr] = None
# role: Optional[str] = None