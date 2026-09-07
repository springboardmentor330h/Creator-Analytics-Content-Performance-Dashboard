from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field


class NotificationCreate(BaseModel):
    creator_id: int = Field(..., gt=0)

    notification_type: str = Field(
        ...,
        min_length=2,
        max_length=50
    )

    title: str = Field(
        ...,
        min_length=2,
        max_length=150
    )

    message: str = Field(
        ...,
        min_length=2
    )


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