from typing import Optional
from pydantic import BaseModel, Field

class NotificationCreate(BaseModel):
    creator_id: int = Field(..., ge=1)
    notification_type: str
    title: str
    message: str

class NotificationUpdate(BaseModel):
    is_read: Optional[bool] = None
