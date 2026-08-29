from pydantic import BaseModel, EmailStr


class UserCreate(BaseModel):
    full_name: str
    email: EmailStr
    password: str
    role: str


class UserUpdate(BaseModel):
    full_name: str | None = None
    email: EmailStr | None = None
    password: str | None = None
    role: str | None = None


class UserResponse(BaseModel):
    id: int
    full_name: str
    email: EmailStr
    role: str
class UserLogin(BaseModel):
    email: EmailStr
    password: str
    class Config:
        from_attributes = True