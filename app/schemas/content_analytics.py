from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, Field


class ContentMetrics(BaseModel):
    """Core metrics tracked for each piece of content."""
    views: int = Field(default=0, ge=0)
    likes: int = Field(default=0, ge=0)
    comments: int = Field(default=0, ge=0)
    shares: int = Field(default=0, ge=0)
    saves: int = Field(default=0, ge=0)
    watch_time_seconds: float = Field(default=0.0, ge=0.0)
    reach: int = Field(default=0, ge=0)
    engagement_rate: float = Field(default=0.0, ge=0.0)


class ContentCreate(BaseModel):
    """Schema for adding new content to track."""
    title: str
    platform: str  # e.g., "Instagram", "YouTube", "TikTok"
    content_type: str  # e.g., "Reel", "Video", "Post"
    metrics: ContentMetrics


class ContentResponse(BaseModel):
    """Schema returned for content queries."""
    content_id: str
    title: str
    platform: str
    content_type: str
    created_at: datetime
    metrics: ContentMetrics


class ContentComparisonRequest(BaseModel):
    """Schema for requesting side-by-side comparison of multiple content IDs."""
    content_ids: List[str]


class ReachAnalysisResponse(BaseModel):
    """Schema for reach and impression breakdown."""
    total_reach: int
    avg_reach_per_post: float
    total_views: int
    platform_breakdown: dict


class TrendDataPoint(BaseModel):
    """Schema representing performance over time."""
    date: str
    views: int
    reach: int
    engagement_rate: float