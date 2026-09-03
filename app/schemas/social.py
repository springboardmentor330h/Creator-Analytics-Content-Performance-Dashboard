from datetime import datetime, timezone
from typing import Optional

from pydantic import BaseModel, Field


class PlatformConnectRequest(BaseModel):
    platform: str = Field(..., json_schema_extra={"example": "YouTube"})
    account_name: str = Field(..., json_schema_extra={"example": "DemoCreator"})


class SyncRequest(BaseModel):
    platform: str = Field(..., json_schema_extra={"example": "YouTube"})
    creator_id: int = Field(default=1, description="Target creator ID")


class YouTubeSyncRequest(BaseModel):
    channel_id: str = Field(
        ...,
        json_schema_extra={"example": "UC_x5XG1OV2P6uZZ5FSM9Ttw"},
        description="YouTube Channel ID",
    )
    creator_id: int = Field(default=1, description="Target creator ID")
    max_results: int = Field(
        default=10, ge=1, le=50, description="Number of recent videos to sync"
    )


class InstagramSyncRequest(BaseModel):
    account_id: str = Field(
        ..., json_schema_extra={"example": "17841400012345678"}, description="Instagram account or media node id"
    )
    access_token: str = Field(..., description="Instagram Graph API access token")
    creator_id: int = Field(default=1, description="Target creator ID")
    max_results: int = Field(default=10, ge=1, le=20, description="Number of recent posts to sync")


class ManualPlatformPostRequest(BaseModel):
    """Metrics entered in Swagger when an API connection is unavailable."""

    content_id: str = Field(..., min_length=1, examples=["manual_post_001"], description="Stable platform post identifier")
    title: str = Field(..., min_length=1, examples=["Creator campaign update"])
    url: Optional[str] = Field(None, examples=["https://www.example.com/post/001"])
    views: int = Field(0, ge=0, examples=[12500])
    likes: int = Field(0, ge=0, examples=[740])
    comments: int = Field(0, ge=0, examples=[48])
    shares: int = Field(0, ge=0, examples=[25])
    reach: int = Field(0, ge=0, examples=[19000])
    published_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc), examples=["2026-09-03T10:00:00Z"])


class InstagramManualPostRequest(ManualPlatformPostRequest):
    """Use shares for Instagram shares/sends and reach for accounts reached."""


class LinkedInManualPostRequest(ManualPlatformPostRequest):
    """Use shares for LinkedIn reposts and reach for impressions/reach."""
