from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

class ContentCreate(BaseModel):
    user_id: int
    title: str = Field(..., min_length=3)
    platform: str
    views: int = 0
    likes: int = 0
    comments: int = 0
    shares: int = 0
    saves: int = 0
    watch_time: float = 0.0
    reach: int = 0

class ContentUpdate(BaseModel):
    title: Optional[str] = None
    platform: Optional[str] = None
    views: Optional[int] = None
    likes: Optional[int] = None
    comments: Optional[int] = None
    shares: Optional[int] = None
    saves: Optional[int] = None
    watch_time: Optional[float] = None
    reach: Optional[int] = None

class ContentOut(BaseModel):
    id: int
    user_id: int
    title: str
    platform: str
    views: int
    likes: int
    comments: int
    shares: int
    saves: int
    watch_time: float
    reach: int
    engagement_rate: float
    created_at: datetime

    class Config:
        from_attributes = True