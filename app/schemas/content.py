from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field


class ContentBase(BaseModel):
    creator_id: UUID
    campaign_id: UUID | None = None

    title: str = Field(..., min_length=1, max_length=255)
    platform: str
    content_type: str

    likes: int = Field(default=0, ge=0)
    comments: int = Field(default=0, ge=0)
    shares: int = Field(default=0, ge=0)
    reach: int = Field(default=0, ge=0)
    impressions: int = Field(default=0, ge=0)

    posted_at: datetime | None = None

    content_title: str = Field(..., min_length=1, max_length=255)

    views: int = Field(default=0, ge=0)
    saves: int = Field(default=0, ge=0)
    watch_time: int = Field(default=0, ge=0)

    published_date: datetime | None = None

    external_content_id: str | None = Field(
        default=None,
        max_length=200
    )


class ContentCreate(ContentBase):
    pass


class ContentUpdate(BaseModel):
    creator_id: UUID | None = None
    campaign_id: UUID | None = None

    title: str | None = Field(
        default=None,
        min_length=1,
        max_length=255
    )

    platform: str | None = None
    content_type: str | None = None

    likes: int | None = Field(default=None, ge=0)
    comments: int | None = Field(default=None, ge=0)
    shares: int | None = Field(default=None, ge=0)
    reach: int | None = Field(default=None, ge=0)
    impressions: int | None = Field(default=None, ge=0)

    posted_at: datetime | None = None

    content_title: str | None = Field(
        default=None,
        min_length=1,
        max_length=255
    )

    views: int | None = Field(default=None, ge=0)
    saves: int | None = Field(default=None, ge=0)
    watch_time: int | None = Field(default=None, ge=0)

    published_date: datetime | None = None

    external_content_id: str | None = Field(
        default=None,
        max_length=200
    )


class ContentResponse(ContentBase):
    id: UUID
    created_at: datetime | None = None

    model_config = ConfigDict(from_attributes=True)