from pydantic import BaseModel, Field, field_validator
from typing import Optional, Literal
from datetime import date

RevenueSource = Literal["sponsorship", "ad_revenue", "affiliate", "brand_collab", "subscription"]


class RevenueCreate(BaseModel):
    creator_id: int
    platform: str
    source: RevenueSource
    description: Optional[str] = None
    amount: float = Field(..., gt=0)
    currency: str = "USD"
    earned_date: date


class RevenueUpdate(BaseModel):
    platform: Optional[str] = None
    source: Optional[RevenueSource] = None
    description: Optional[str] = None
    amount: Optional[float] = Field(None, gt=0)
    currency: Optional[str] = None
    earned_date: Optional[date] = None


class RevenueOut(BaseModel):
    id: int
    creator_id: int
    platform: str
    source: str
    description: Optional[str]
    amount: float
    currency: str
    earned_date: date

    class Config:
        from_attributes = True


class RevenueSummary(BaseModel):
    total_earnings: float
    by_source: dict
    by_platform: dict
    record_count: int