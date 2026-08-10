from pydantic import BaseModel, Field
from typing import Optional
from datetime import date


class ContentCreate(BaseModel):
    content_title: str = Field(..., min_length=3)
    platform: str
    content_type: str
    views: int = Field(default=0, ge=0)
    likes: int = Field(default=0, ge=0)
    comments: int = Field(default=0, ge=0)
    shares: int = Field(default=0, ge=0)
    saves: int = Field(default=0, ge=0)
    watch_time: int = Field(default=0, ge=0)
    reach: int = Field(default=0, ge=0)
    published_date: date


class ContentUpdate(BaseModel):
    content_title: Optional[str] = Field(default=None, min_length=3)
    platform: Optional[str] = None
    content_type: Optional[str] = None
    views: Optional[int] = Field(default=None, ge=0)
    likes: Optional[int] = Field(default=None, ge=0)
    comments: Optional[int] = Field(default=None, ge=0)
    shares: Optional[int] = Field(default=None, ge=0)
    saves: Optional[int] = Field(default=None, ge=0)
    watch_time: Optional[int] = Field(default=None, ge=0)
    reach: Optional[int] = Field(default=None, ge=0)
    published_date: Optional[date] = None


class ContentResponse(BaseModel):
    id: int
    creator_id: int
    content_title: str
    platform: str
    content_type: str
    views: int
    likes: int
    comments: int
    shares: int
    saves: int
    watch_time: int
    reach: int
    engagement_rate: float
    published_date: date

    class Config:
        from_attributes = True
