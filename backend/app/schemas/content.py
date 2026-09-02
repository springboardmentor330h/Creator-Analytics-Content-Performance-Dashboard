import uuid
from datetime import datetime
from typing import Optional, List

from pydantic import BaseModel, Field

from app.models.content import Platform, ContentType


class ContentCreate(BaseModel):
    platform: Platform
    content_type: ContentType
    title: str = Field(..., min_length=1, max_length=255)
    publish_date: datetime
    reach: int = Field(0, ge=0)
    impressions: int = Field(0, ge=0)
    likes: int = Field(0, ge=0)
    comments: int = Field(0, ge=0)
    shares: int = Field(0, ge=0)
    saves: int = Field(0, ge=0)
    views: int = Field(0, ge=0)


class ContentUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=1, max_length=255)
    reach: Optional[int] = Field(None, ge=0)
    impressions: Optional[int] = Field(None, ge=0)
    likes: Optional[int] = Field(None, ge=0)
    comments: Optional[int] = Field(None, ge=0)
    shares: Optional[int] = Field(None, ge=0)
    saves: Optional[int] = Field(None, ge=0)
    views: Optional[int] = Field(None, ge=0)


class ContentResponse(BaseModel):
    id: uuid.UUID
    creator_id: uuid.UUID
    platform: Platform
    content_type: ContentType
    title: str
    publish_date: datetime
    reach: int
    impressions: int
    likes: int
    comments: int
    shares: int
    saves: int
    views: int
    engagement_rate: float  # computed, not a DB column — see service layer
    created_at: datetime

    class Config:
        from_attributes = True


class ContentListResponse(BaseModel):
    total: int
    items: List[ContentResponse]


class PlatformComparisonItem(BaseModel):
    platform: Platform
    total_content: int
    total_reach: int
    total_engagement: int
    avg_engagement_rate: float


class KPISummary(BaseModel):
    total_content: int
    total_reach: int
    total_impressions: int
    total_engagement: int
    avg_engagement_rate: float
