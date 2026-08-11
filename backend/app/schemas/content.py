from pydantic import BaseModel, Field, field_validator
from typing import Optional
from datetime import date


class ContentCreate(BaseModel):
    creator_id: int
    platform: str
    content_title: str = Field(..., min_length=3)
    views: int = 0
    likes: int = 0
    comments: int = 0
    shares: int = 0
    saves: int = 0
    watch_time: int = 0
    reach: int = 0
    published_date: date

    @field_validator("views", "likes", "comments", "shares", "saves", "watch_time", "reach")
    @classmethod
    def no_negative_values(cls, value):
        if value < 0:
            raise ValueError("Value cannot be negative")
        return value


class ContentUpdate(BaseModel):
    creator_id: Optional[int] = None
    platform: Optional[str] = None
    content_title: Optional[str] = Field(None, min_length=3)
    views: Optional[int] = None
    likes: Optional[int] = None
    comments: Optional[int] = None
    shares: Optional[int] = None
    saves: Optional[int] = None
    watch_time: Optional[int] = None
    reach: Optional[int] = None
    published_date: Optional[date] = None

    @field_validator("views", "likes", "comments", "shares", "saves", "watch_time", "reach")
    @classmethod
    def no_negative_values(cls, value):
        if value is not None and value < 0:
            raise ValueError("Value cannot be negative")
        return value


class ContentOut(BaseModel):
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