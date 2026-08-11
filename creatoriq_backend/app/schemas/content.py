from datetime import date, datetime
from typing import List, Literal, Optional

from pydantic import AliasChoices, BaseModel, ConfigDict, Field, field_serializer, field_validator

Platform = Literal['YouTube', 'Instagram', 'TikTok', 'Facebook', 'X', 'LinkedIn']
ContentType = Literal['Video', 'Post', 'Reel', 'Short', 'Article', 'Live']


class ContentCreate(BaseModel):
    creator_id: Optional[int] = None
    title: str = Field(min_length=3, max_length=255, validation_alias=AliasChoices('title', 'content_title'))
    platform: Platform
    content_type: ContentType = 'Video'
    published_at: date = Field(validation_alias=AliasChoices('published_at', 'published_date'))
    views: int = Field(ge=0, default=0)
    likes: int = Field(ge=0, default=0)
    comments: int = Field(ge=0, default=0)
    shares: int = Field(ge=0, default=0)
    saves: int = Field(ge=0, default=0)
    watch_time: int = Field(ge=0, default=0)
    reach: int = Field(ge=0, default=0)

    @field_validator('title')
    @classmethod
    def strip_title(cls, value: str) -> str:
        cleaned = value.strip()
        if len(cleaned) < 3:
            raise ValueError('title must be at least 3 characters')
        return cleaned


class ContentUpdate(BaseModel):
    title: Optional[str] = Field(default=None, min_length=3, max_length=255, validation_alias=AliasChoices('title', 'content_title'))
    platform: Optional[Platform] = None
    content_type: Optional[ContentType] = None
    published_at: Optional[date] = Field(default=None, validation_alias=AliasChoices('published_at', 'published_date'))
    views: Optional[int] = Field(default=None, ge=0)
    likes: Optional[int] = Field(default=None, ge=0)
    comments: Optional[int] = Field(default=None, ge=0)
    shares: Optional[int] = Field(default=None, ge=0)
    saves: Optional[int] = Field(default=None, ge=0)
    watch_time: Optional[int] = Field(default=None, ge=0)
    reach: Optional[int] = Field(default=None, ge=0)

    @field_validator('title')
    @classmethod
    def strip_title(cls, value: Optional[str]) -> Optional[str]:
        if value is None:
            return value
        cleaned = value.strip()
        if len(cleaned) < 3:
            raise ValueError('title must be at least 3 characters')
        return cleaned


class ContentResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    creator_id: int
    content_id: str
    title: str
    platform: str
    content_type: str
    published_at: date
    views: int
    likes: int
    comments: int
    shares: int
    saves: int
    watch_time: int
    reach: int
    engagement_rate: float
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    @field_serializer('created_at', 'updated_at')
    def serialize_datetimes(self, value: Optional[datetime]) -> Optional[str]:
        return value.isoformat() if value is not None else None


class ContentListResponse(BaseModel):
    items: List[ContentResponse]
    page: int
    page_size: int
    total: int
    total_pages: int


class ContentAnalyticsResponse(BaseModel):
    content_count: int = 0
    total_views: int = 0
    total_likes: int = 0
    total_comments: int = 0
    total_shares: int = 0
    total_saves: int = 0
    total_reach: int = 0
    total_watch_time: int = 0
    average_engagement_rate: float = 0.0
    # Backward-compatible aliases used by the existing frontend
    views: int = 0
    likes: int = 0
    comments: int = 0
    shares: int = 0
    saves: int = 0
    reach: int = 0
    watch_time: int = 0
    engagement: int = 0


class ContentComparisonItem(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    title: str
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


class ContentComparisonResponse(BaseModel):
    items: List[ContentComparisonItem]


class ContentTrendPoint(BaseModel):
    date: str
    views: int
    likes: int
    comments: int
    shares: int
    reach: int = 0
    engagement_rate: float = 0.0
