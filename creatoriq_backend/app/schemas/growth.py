from datetime import date
from typing import Optional
from pydantic import BaseModel, ConfigDict, Field


class GrowthCreate(BaseModel):
    creator_id: Optional[int] = None
    date: date
    followers: int = Field(..., ge=0)
    reach: int = Field(..., ge=0)
    engagement_rate: float = Field(..., ge=0.0)


class GrowthUpdate(BaseModel):
    creator_id: Optional[int] = None
    date: Optional[date] = None
    followers: Optional[int] = Field(None, ge=0)
    reach: Optional[int] = Field(None, ge=0)
    engagement_rate: Optional[float] = Field(None, ge=0.0)


class GrowthResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    creator_id: int
    date: date
    followers: int
    reach: int
    engagement_rate: float


class GrowthAnalyticsPoint(BaseModel):
    date: str
    followers: int
    daily_growth: int
    growth_percentage: float


class AudienceTrendPoint(BaseModel):
    date: str
    followers: int
    reach: int
