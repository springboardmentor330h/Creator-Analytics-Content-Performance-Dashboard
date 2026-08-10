from datetime import date
from typing import Optional

from pydantic import BaseModel, Field


class ContentCreate(BaseModel):
    creator_id: int
    platform: str
    content_title: str = Field(..., min_length=3)

    views: int = Field(default=0, ge=0)
    likes: int = Field(default=0, ge=0)
    comments: int = Field(default=0, ge=0)
    shares: int = Field(default=0, ge=0)
    saves: int = Field(default=0, ge=0)

    watch_time: int = Field(default=0, ge=0)
    reach: int = Field(default=0, ge=0)

    published_date: date


class ContentUpdate(BaseModel):
    creator_id: Optional[int] = None
    platform: Optional[str] = None
    content_title: Optional[str] = Field(None, min_length=3)

    views: Optional[int] = Field(None, ge=0)
    likes: Optional[int] = Field(None, ge=0)
    comments: Optional[int] = Field(None, ge=0)
    shares: Optional[int] = Field(None, ge=0)
    saves: Optional[int] = Field(None, ge=0)

    watch_time: Optional[int] = Field(None, ge=0)
    reach: Optional[int] = Field(None, ge=0)

    published_date: Optional[date] = None


class ContentResponse(BaseModel):
    id: int
    creator_id: int
    platform: str
    content_title: str

    views: int
    likes: int
    comments: int
    shares: int
    saves: int

    watch_time: int
    reach: int

    published_date: date

    class Config:
        from_attributes = True