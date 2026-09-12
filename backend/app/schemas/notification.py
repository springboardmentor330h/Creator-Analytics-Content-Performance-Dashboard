import uuid
from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field

from app.models.notification import NotificationType


class NotificationCreate(BaseModel):
    notification_type: NotificationType
    title: str = Field(..., min_length=1, max_length=200)
    message: str = Field(..., min_length=1)


class NotificationResponse(BaseModel):
    id: uuid.UUID
    notification_type: NotificationType
    title: str
    message: str
    is_read: bool
    created_at: datetime

    class Config:
        from_attributes = True


class NotificationListResponse(BaseModel):
    total: int
    unread_count: int
    items: list[NotificationResponse]


class NotificationUpdate(BaseModel):
    is_read: bool
