from pydantic import BaseModel
from datetime import datetime
from typing import Optional


class NotificationCreate(BaseModel):
    creator_id: int
    notification_type: str
    title: str
    message: str


class NotificationUpdate(BaseModel):
    is_read: Optional[bool] = None


class NotificationResponse(BaseModel):
    id: int
    creator_id: int
    notification_type: str
    title: str
    message: str
    is_read: bool
    created_at: datetime

    class Config:
        from_attributes = True