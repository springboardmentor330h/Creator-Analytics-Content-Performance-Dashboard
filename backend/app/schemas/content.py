from datetime import date
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
    platform: str | None = None
    content_title: str | None = Field(default=None, min_length=3)

    views: int | None = Field(default=None, ge=0)
    likes: int | None = Field(default=None, ge=0)
    comments: int | None = Field(default=None, ge=0)
    shares: int | None = Field(default=None, ge=0)
    saves: int | None = Field(default=None, ge=0)

    watch_time: int | None = Field(default=None, ge=0)
    reach: int | None = Field(default=None, ge=0)

    published_date: date | None = None