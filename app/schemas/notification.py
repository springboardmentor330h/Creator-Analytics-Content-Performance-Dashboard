from datetime import datetime
from typing import List

from pydantic import BaseModel, ConfigDict


class NotificationResponse(BaseModel):
    id: int
    creator_id: int
    notification_type: str
    title: str
    message: str
    is_read: bool
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class NotificationListResponse(BaseModel):
    total: int
    unread: int
    notifications: List[NotificationResponse]
