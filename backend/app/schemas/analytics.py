from pydantic import BaseModel
from typing import Optional, List, Dict

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

class PlatformReachItem(BaseModel):
    platform: str
    reach: int
    views: int
    likes: int
    percentage_share: float

class PlatformReachBreakdownResponse(BaseModel):
    combined_total_reach: int
    combined_total_views: int
    platform_breakdown: List[PlatformReachItem]

class DashboardSummaryResponse(BaseModel):
    total_views: int
    total_likes: int
    total_comments: int
    total_shares: int
    total_reach: int
    total_followers: int
    average_engagement_rate: float
    total_content: Optional[int] = None
    best_platform: Optional[str] = None
    top_content: Optional[str] = None

class ChartDataResponse(BaseModel):
    labels: List[str]
    values: List[float]

class PlatformComparisonMetrics(BaseModel):
    views: int
    reach: int
    engagement_rate: float
    likes: Optional[int] = 0
    comments: Optional[int] = 0


