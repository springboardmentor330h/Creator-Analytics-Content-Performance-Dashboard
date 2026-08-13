from pydantic import BaseModel, Field
from typing import Optional
from datetime import date

class ContentCreate(BaseModel):
    creator_id: int
    platform: str
    content_title: str = Field(..., min_length=3)
    views: int = Field(0, ge=0)
    likes: int = Field(0, ge=0)
    comments: int = Field(0, ge=0)
    shares: int = Field(0, ge=0)
    saves: int = Field(0, ge=0)
    watch_time: float = Field(0.0, ge=0)
    reach: int = Field(0, ge=0)
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
    watch_time: Optional[float] = Field(None, ge=0)
    reach: Optional[int] = Field(None, ge=0)
    published_date: Optional[date] = None