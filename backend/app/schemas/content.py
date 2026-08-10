from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
import uuid

class ContentSyncRequest(BaseModel):
    channel_id: Optional[str] = None
    search_query: Optional[str] = None
    max_results: int = 10

class ContentItemOut(BaseModel):
    id: uuid.UUID
    video_id: str
    title: str
    channel_title: Optional[str]
    thumbnail_url: Optional[str]
    published_at: Optional[datetime]
    views: int
    likes: int
    comments: int
    shares: int
    saves: int
    watch_time_minutes: float
    engagement_rate: float = 0.0
    reach: int = 0

    class Config:
        from_attributes = True

class ContentAnalyticsSummary(BaseModel):
    total_videos: int
    total_views: int
    total_likes: int
    total_comments: int
    total_reach: int
    avg_engagement_rate: float
    top_video: Optional[ContentItemOut] = None

class ContentComparisonRequest(BaseModel):
    video_ids: List[str]  # your internal ContentItem IDs (as strings)

class TrendPoint(BaseModel):
    date: str
    views: int
    likes: int
    comments: int