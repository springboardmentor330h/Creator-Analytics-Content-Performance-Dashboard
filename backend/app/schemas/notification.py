from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field, ConfigDict


class NotificationBase(BaseModel):
    creator_id: int
    type: str = Field(..., min_length=1)
    title: str = Field(..., min_length=1)
    message: str = Field(..., min_length=1)
    is_read: bool = False


class NotificationCreate(NotificationBase):
    pass


class NotificationUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=1)
    message: Optional[str] = Field(None, min_length=1)
    is_read: Optional[bool] = None


class NotificationResponse(NotificationBase):
    id: int
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)