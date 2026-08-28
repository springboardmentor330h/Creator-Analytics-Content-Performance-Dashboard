from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class NotificationCreate(BaseModel):
    creator_id: int
    type: str
    title: str
    message: str

class NotificationOut(BaseModel):
    id: int
    creator_id: int
    type: str
    title: str
    message: str
    is_read: bool
    created_at: datetime

    class Config:
        from_attributes = True