from datetime import date
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field, field_validator


REVENUE_SOURCES = [
    "Sponsorships",
    "Ad Revenue",
    "Affiliate Marketing",
    "Brand Collaborations",
    "Subscription Revenue",
]


class RevenueCreate(BaseModel):
    creator_id: int = Field(..., ge=1)
    source: str = Field(..., min_length=1, max_length=80)
    amount: float = Field(..., ge=0)
    currency: str = Field(default="INR", min_length=1, max_length=10)
    received_date: date
    description: Optional[str] = Field(default=None, max_length=500)

    @field_validator("source")
    @classmethod
    def validate_source(cls, value: str):
        if value not in REVENUE_SOURCES:
            raise ValueError(
                f"source must be one of: {', '.join(REVENUE_SOURCES)}"
            )
        return value


class RevenueUpdate(BaseModel):
    source: Optional[str] = Field(default=None, min_length=1, max_length=80)
    amount: Optional[float] = Field(default=None, ge=0)
    currency: Optional[str] = Field(default=None, min_length=1, max_length=10)
    received_date: Optional[date] = None
    description: Optional[str] = Field(default=None, max_length=500)

    @field_validator("source")
    @classmethod
    def validate_source(cls, value):
        if value is not None and value not in REVENUE_SOURCES:
            raise ValueError(
                f"source must be one of: {', '.join(REVENUE_SOURCES)}"
            )
        return value


class RevenueResponse(RevenueCreate):
    id: int

    model_config = ConfigDict(from_attributes=True)


class RevenueBySource(BaseModel):
    source: str
    revenue: float


class MonthlyRevenue(BaseModel):
    month: str
    revenue: float


class RevenueTrend(BaseModel):
    month: str
    revenue: float
