from pydantic import BaseModel
from datetime import datetime


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


class NotificationCountOut(BaseModel):
    total: int
    unread: int