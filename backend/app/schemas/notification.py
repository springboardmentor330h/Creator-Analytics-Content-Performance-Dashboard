from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime


class NotificationBase(BaseModel):
    title: str = Field(..., example="Revenue Milestone Reached")
    message: str = Field(..., example="Your monthly revenue exceeded $5,000!")
    type: str = Field("system", example="revenue")  # performance, engagement, revenue, system
    severity: str = Field("info", example="success")  # info, success, warning, alert
    action_url: Optional[str] = None


class NotificationCreate(NotificationBase):
    pass


class NotificationUpdate(BaseModel):
    is_read: Optional[bool] = None


class NotificationResponse(NotificationBase):
    id: int
    creator_id: int
    is_read: bool
    created_at: datetime

    class Config:
        from_attributes = True


class NotificationSummaryResponse(BaseModel):
    total_count: int
    unread_count: int
    notifications: List[NotificationResponse]
