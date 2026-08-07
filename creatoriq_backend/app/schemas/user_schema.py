from pydantic import BaseModel
class User(BaseModel):
    id:int
    name:str 
    email:str 
    role:str 
    

from pydantic import BaseModel, EmailStr
from typing import Optional
class UserCreate(BaseModel):
    full_name: str
    email: EmailStr
    role: str
class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    email: Optional[EmailStr] = None
    role: Optional[str] = None

#5 august 2026
from pydantic import BaseModel

class UserLogin(BaseModel):
    email: str
    password: str