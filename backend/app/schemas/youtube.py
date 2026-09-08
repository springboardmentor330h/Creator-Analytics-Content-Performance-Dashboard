from typing import Optional
from pydantic import BaseModel, Field


class YouTubeSyncRequest(BaseModel):
    channel_id: str = Field(..., min_length=1, description="YouTube channel ID, e.g. UCX6OQ3DkcsbYNE6H8uQQuVA")


class YouTubeChannelInfo(BaseModel):
    channel_id: str
    title: str
    subscriber_count: int
    view_count: int
    video_count: int


class YouTubeSyncResponse(BaseModel):
    success: bool
    channel: Optional[YouTubeChannelInfo] = None
    videos_synced: int
    videos_updated: int
    error: Optional[str] = None
