from pydantic import BaseModel
from datetime import datetime

class ManagerOut(BaseModel):
    id: str
    full_name: str
    role: str

class ContractCreate(BaseModel):
    manager_user_id: str

class ContractOut(BaseModel):
    id: int
    manager_user_id: str
    creator_id: int
    status: str
    created_at: datetime

    class Config:
        from_attributes = True