import uuid
from datetime import datetime, date
from typing import Optional, List

from pydantic import BaseModel, Field

from app.models.content import Platform
from app.models.revenue import RevenueType, RevenueStatus, SponsorshipStatus


class RevenueCreate(BaseModel):
    source: Platform
    amount: float = Field(..., gt=0)
    currency: str = Field("USD", min_length=3, max_length=3)
    date: date
    revenue_type: RevenueType
    status: RevenueStatus = RevenueStatus.received
    notes: Optional[str] = None


class RevenueUpdate(BaseModel):
    amount: Optional[float] = Field(None, gt=0)
    status: Optional[RevenueStatus] = None
    notes: Optional[str] = None


class RevenueResponse(BaseModel):
    id: uuid.UUID
    source: Platform
    amount: float
    currency: str
    date: date
    revenue_type: RevenueType
    status: RevenueStatus
    notes: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True


class SponsorshipCreate(BaseModel):
    brand: str = Field(..., min_length=1, max_length=200)
    campaign: str = Field(..., min_length=1, max_length=200)
    amount: float = Field(..., gt=0)
    status: SponsorshipStatus = SponsorshipStatus.pending
    start_date: date
    end_date: Optional[date] = None
    notes: Optional[str] = None


class SponsorshipUpdate(BaseModel):
    status: Optional[SponsorshipStatus] = None
    end_date: Optional[date] = None
    notes: Optional[str] = None


class SponsorshipResponse(BaseModel):
    id: uuid.UUID
    brand: str
    campaign: str
    amount: float
    status: SponsorshipStatus
    start_date: date
    end_date: Optional[date]
    notes: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True


class MonthlyRevenuePoint(BaseModel):
    month: str  # "2026-01"
    total: float


class RevenueByPlatform(BaseModel):
    source: Platform
    total: float


class RevenueBySource(BaseModel):
    revenue_type: RevenueType
    total: float


class RevenueKPISummary(BaseModel):
    total_revenue: float
    pending_revenue: float
    total_sponsorship_value: float
    active_sponsorships: int
