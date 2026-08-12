from pydantic import BaseModel


# class EngagementResponse(BaseModel):
#     content_id: int
#     likes: int
#     comments: int
#     shares: int
#     saves: int
#     engagement_rate: float
class EngagementResponse(BaseModel):
    content_id: int
    platform: str
    views: int
    reach: int
    total_engagement: int
    engagement_rate: float

class ContentComparisonResponse(BaseModel):
    content_id: int
    title: str
    platform: str
    views: int
    likes: int
    comments: int
    shares: int
    saves: int
    watch_time: int
    reach: int
    engagement_rate: float

class TopPerformingContentResponse(BaseModel):
    content_id: int
    title: str
    platform: str
    views: int
    likes: int
    comments: int
    shares: int
    saves: int
    reach: int
    engagement_rate: float

class ReachAnalysisResponse(BaseModel):
    content_id: int
    title: str
    platform: str
    reach: int

class PerformanceTrendsResponse(BaseModel):
    content_id: int
    title: str
    platform: str
    views: int
    likes: int
    comments: int
    shares: int
    saves: int
    reach: int
    engagement_rate: float

class TopContentResponse(BaseModel):
    title: str
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

class SummaryResponse(BaseModel):
    total_content: int
    total_views: int
    total_reach: int
    average_engagement_rate: float
    best_platform: str
    top_content: str