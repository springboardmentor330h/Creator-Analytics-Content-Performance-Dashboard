from pydantic import BaseModel, Field, field_validator
from typing import Optional, List, Dict
import datetime

VALID_REVENUE_SOURCES = [
    "Sponsorships",
    "Ad Revenue",
    "Affiliate Marketing",
    "Brand Collaborations",
    "Subscription Revenue"
]


class RevenueBase(BaseModel):
    source: str = Field(..., description="Revenue source stream")
    amount: float = Field(..., gt=0, description="Amount earned in USD or local currency")
    currency: str = Field("USD", description="Currency code (e.g. USD, EUR, INR)")
    description: Optional[str] = Field(None, description="Additional context or notes for transaction")
    date: datetime.date = Field(..., description="Date when revenue was earned or recorded")

    @field_validator("source")
    @classmethod
    def validate_source(cls, v: str) -> str:
        matched = next((s for s in VALID_REVENUE_SOURCES if s.lower() == v.lower()), None)
        if matched:
            return matched
        return v


class RevenueCreate(RevenueBase):
    pass


class RevenueUpdate(BaseModel):
    source: Optional[str] = None
    amount: Optional[float] = Field(None, gt=0)
    currency: Optional[str] = None
    description: Optional[str] = None
    date: Optional[datetime.date] = None


class RevenueResponse(RevenueBase):
    id: int
    creator_id: int
    created_at: Optional[datetime.datetime] = None

    class Config:
        from_attributes = True


class RevenueSourceBreakdown(BaseModel):
    source: str
    amount: float
    percentage: float


class MonthlyRevenueItem(BaseModel):
    month: str
    year: int
    amount: float
    by_source: Dict[str, float] = {}


class RevenueTrendItem(BaseModel):
    date: str
    amount: float
    source: str


class RevenueSummaryResponse(BaseModel):
    total_revenue: float
    total_sponsorship_revenue: float
    total_ad_revenue: float
    total_affiliate_revenue: float
    total_collaboration_revenue: float
    total_subscription_revenue: float
    revenue_by_source: List[RevenueSourceBreakdown]
    monthly_revenue: List[MonthlyRevenueItem]
