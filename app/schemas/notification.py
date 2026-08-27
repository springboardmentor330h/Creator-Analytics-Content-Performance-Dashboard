from datetime import datetime
from pydantic import BaseModel, ConfigDict


class NotificationBase(BaseModel):
    notification_type: str
    title: str
    message: str


class NotificationCreate(NotificationBase):
    pass


class NotificationResponse(NotificationBase):
    id: int
    creator_id: int
    is_read: bool
    created_at: datetime | None = None

    model_config = ConfigDict(from_attributes=True)


class NotificationReadResponse(BaseModel):
    message: str