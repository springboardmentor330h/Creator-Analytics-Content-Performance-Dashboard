from datetime import date
from enum import Enum
from typing import Optional

from pydantic import BaseModel, Field


class RevenueSourceEnum(str, Enum):
    SPONSORSHIP = "sponsorship"
    AD_REVENUE = "ad_revenue"
    AFFILIATE_MARKETING = "affiliate_marketing"
    BRAND_COLLABORATION = "brand_collaboration"
    SUBSCRIPTION_REVENUE = "subscription_revenue"


class RevenueCreate(BaseModel):
    # creator_id is NOT accepted from the client.
    # It is derived from the authenticated user's JWT token
    # so that a creator can never create a revenue record
    # under someone else's account.
    source: RevenueSourceEnum
    amount: float = Field(..., gt=0)
    currency: str = Field(default="USD", min_length=3, max_length=10)
    description: Optional[str] = None
    date: date


class RevenueUpdate(BaseModel):
    source: Optional[RevenueSourceEnum] = None
    amount: Optional[float] = Field(None, gt=0)
    currency: Optional[str] = Field(None, min_length=3, max_length=10)
    description: Optional[str] = None
    date: Optional[date] = None


class RevenueResponse(BaseModel):
    id: int
    creator_id: int
    source: str
    amount: float
    currency: str
    description: Optional[str] = None
    date: date

    class Config:
        from_attributes = True


class RevenueBySource(BaseModel):
    source: str
    total_amount: float


class MonthlyRevenue(BaseModel):
    month: str  # e.g. "2026-08"
    total_amount: float


class RevenueSummary(BaseModel):
    total_revenue: float
    total_records: int
    revenue_by_source: list[RevenueBySource]


class RevenueTrendPoint(BaseModel):
    labels: list[str]
    values: list[float]