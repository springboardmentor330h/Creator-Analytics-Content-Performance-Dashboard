from datetime import datetime, timezone
from typing import Literal, Optional

from pydantic import BaseModel, ConfigDict, Field


SupportedPlatform = Literal["YouTube", "Instagram", "LinkedIn", "Twitter", "TikTok", "Facebook"]


class ContentItemCreate(BaseModel):
    """Manual post metrics accepted from Swagger or another platform connector."""

    platform: SupportedPlatform = Field(..., examples=["Instagram"])
    content_id: str = Field(..., min_length=1, max_length=255, examples=["ig_17899200123456789"])
    title: str = Field(..., min_length=1, max_length=500, examples=["Behind the scenes: campaign shoot"])
    url: Optional[str] = Field(None, max_length=2048, examples=["https://www.instagram.com/p/example/"])
    views: int = Field(0, ge=0, examples=[24500])
    likes: int = Field(0, ge=0, examples=[1840])
    comments: int = Field(0, ge=0, examples=[124])
    shares: int = Field(0, ge=0, examples=[82])
    reach: int = Field(0, ge=0, examples=[38200])
    published_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class ContentItemResponse(ContentItemCreate):
    id: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
