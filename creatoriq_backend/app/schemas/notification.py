from datetime import datetime
from enum import Enum
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field


class NotificationType(str, Enum):
    PERFORMANCE = "performance"
    ENGAGEMENT = "engagement"
    REVENUE = "revenue"
    INFO = "info"


class NotificationCreate(BaseModel):
    creator_id: int
    title: str = Field(..., min_length=3, max_length=255)
    message: str = Field(..., min_length=3)
    type: NotificationType = NotificationType.INFO
    link: Optional[str] = None


class NotificationUpdate(BaseModel):
    is_read: Optional[bool] = None
    title: Optional[str] = Field(None, min_length=3, max_length=255)
    message: Optional[str] = Field(None, min_length=3)


class NotificationResponse(BaseModel):
    id: int
    creator_id: int
    title: str
    message: str
    type: str
    is_read: bool
    link: Optional[str] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class NotificationListResponse(BaseModel):
    total: int
    unread_count: int
    items: list[NotificationResponse]
