import uuid
from datetime import datetime, date
from typing import List, Optional

from pydantic import BaseModel, Field

from app.models.content import Platform
from app.models.audience import AgeGroup, Gender


class AudienceDemographicCreate(BaseModel):
    platform: Platform
    snapshot_date: date
    age_group: AgeGroup
    gender: Gender
    country: str = Field(..., min_length=1, max_length=100)
    percentage: float = Field(..., ge=0, le=100)


class AudienceDemographicResponse(BaseModel):
    id: uuid.UUID
    platform: Platform
    snapshot_date: date
    age_group: AgeGroup
    gender: Gender
    country: str
    percentage: float

    class Config:
        from_attributes = True


class DemographicBreakdown(BaseModel):
    """Aggregated view: e.g. total % per age group, across all countries."""
    label: str
    percentage: float


class GeographicBreakdown(BaseModel):
    country: str
    percentage: float


class AudienceGrowthCreate(BaseModel):
    platform: Platform
    record_date: date
    follower_count: int = Field(..., ge=0)


class AudienceGrowthResponse(BaseModel):
    id: uuid.UUID
    platform: Platform
    record_date: date
    follower_count: int

    class Config:
        from_attributes = True


class GrowthTrendPoint(BaseModel):
    record_date: date
    follower_count: int


class GrowthSummary(BaseModel):
    platform: Platform
    current_followers: int
    followers_gained: int
    growth_rate_percent: float
    period_days: int


class AudienceKPISummary(BaseModel):
    total_followers: int
    total_growth_rate_percent: float
    top_country: Optional[str] = None
    top_age_group: Optional[str] = None
