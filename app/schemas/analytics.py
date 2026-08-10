from pydantic import BaseModel


class EngagementResponse(BaseModel):
    content_id: int
    likes: int
    comments: int
    shares: int
    saves: int
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