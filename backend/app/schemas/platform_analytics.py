from typing import List
from pydantic import BaseModel

from app.models.content import Platform


class PlatformSnapshot(BaseModel):
    """
    One platform's normalized state — the common shape every platform's
    data gets mapped into, regardless of how that platform's raw API
    represents things. This is what lets the dashboard compare YouTube,
    Instagram, and TikTok side by side without special-casing each one.
    """
    platform: Platform
    followers: int
    total_content: int
    total_reach: int
    avg_engagement_rate: float
    growth_rate_percent: float
    is_mock_data: bool  # True until a real integration replaces it (see Sprint 5)


class CrossPlatformKPIs(BaseModel):
    total_followers: int
    total_content: int
    total_reach: int
    overall_avg_engagement_rate: float
    platforms_tracked: int


class PlatformGrowthComparisonPoint(BaseModel):
    platform: Platform
    growth_rate_percent: float


class PlatformEngagementComparisonPoint(BaseModel):
    platform: Platform
    avg_engagement_rate: float
