from datetime import datetime
from typing import List, Literal, Optional
from pydantic import BaseModel, ConfigDict, Field, field_serializer, field_validator

NotificationType = Literal["performance", "engagement", "revenue", "general"]


class NotificationCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=255)
    message: str = Field(..., min_length=1)
    notification_type: NotificationType = Field(default="general")
    is_read: bool = Field(default=False)

    @field_validator("title", "message")
    @classmethod
    def strip_strings(cls, v: str) -> str:
        if isinstance(v, str):
            cleaned = v.strip()
            if not cleaned:
                raise ValueError("Field cannot be empty or only whitespace")
            return cleaned
        return v


class NotificationUpdate(BaseModel):
    title: Optional[str] = Field(default=None, min_length=1, max_length=255)
    message: Optional[str] = Field(default=None, min_length=1)
    notification_type: Optional[NotificationType] = None
    is_read: Optional[bool] = None

    @field_validator("title", "message")
    @classmethod
    def strip_optional_strings(cls, v: Optional[str]) -> Optional[str]:
        if v is None:
            return v
        cleaned = v.strip()
        if not cleaned:
            raise ValueError("Field cannot be empty or only whitespace")
        return cleaned


class NotificationResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    creator_id: int
    title: str
    message: str
    notification_type: str
    is_read: bool = False
    created_at: Optional[datetime] = None

    @field_serializer("created_at")
    def serialize_created_at(self, value: Optional[datetime]) -> Optional[str]:
        return value.isoformat() if value is not None else None


class NotificationSummaryResponse(BaseModel):
    total_count: int
    unread_count: int
    notifications: List[NotificationResponse]
