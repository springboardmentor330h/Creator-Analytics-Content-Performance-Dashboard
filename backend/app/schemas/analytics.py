from pydantic import BaseModel
from typing import Optional

class ContentEngagementResponse(BaseModel):
    content_id: int
    platform: str
    views: int
    reach: int
    total_engagement: int
    engagement_rate: float

class TopContentResponse(BaseModel):
    content_id: int
    content_title: str
    platform: str
    views: int
    reach: int
    watch_time: int
    engagement_rate: float

class PlatformPerformanceResponse(BaseModel):
    platform: str
    total_views: int
    total_likes: int
    total_comments: int
    total_reach: int
    average_engagement_rate: float

class DashboardSummaryResponse(BaseModel):
    total_content: int
    total_views: int
    total_reach: int
    average_engagement_rate: float
    best_platform: Optional[str] = None
    top_content: Optional[str] = None
