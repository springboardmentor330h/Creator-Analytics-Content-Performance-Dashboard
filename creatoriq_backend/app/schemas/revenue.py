from datetime import date, datetime
from typing import List, Literal, Optional
from pydantic import BaseModel, ConfigDict, Field, field_serializer, field_validator

RevenueSource = Literal[
    "Sponsorship",
    "Ad Revenue",
    "Affiliate Marketing",
    "Brand Collaboration",
    "Subscription Revenue",
]


class RevenueCreate(BaseModel):
    source: RevenueSource
    amount: float = Field(ge=0, description="Revenue amount, must be non-negative")
    currency: str = Field(default="INR", min_length=1, max_length=10)
    description: Optional[str] = None
    revenue_date: date

    @field_validator("currency")
    @classmethod
    def validate_currency(cls, value: str) -> str:
        cleaned = value.strip().upper()
        if not cleaned:
            raise ValueError("currency cannot be empty")
        return cleaned


class RevenueUpdate(BaseModel):
    source: Optional[RevenueSource] = None
    amount: Optional[float] = Field(default=None, ge=0)
    currency: Optional[str] = Field(default=None, min_length=1, max_length=10)
    description: Optional[str] = None
    revenue_date: Optional[date] = None

    @field_validator("currency")
    @classmethod
    def validate_currency(cls, value: Optional[str]) -> Optional[str]:
        if value is None:
            return value
        cleaned = value.strip().upper()
        if not cleaned:
            raise ValueError("currency cannot be empty")
        return cleaned


class RevenueResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    creator_id: int
    source: str
    amount: float
    currency: str
    description: Optional[str] = None
    revenue_date: date
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    @field_serializer("created_at", "updated_at")
    def serialize_datetimes(self, value: Optional[datetime]) -> Optional[str]:
        return value.isoformat() if value is not None else None


class RevenueSummaryResponse(BaseModel):
    total_revenue: float
    currency: str = "INR"


class RevenueMonthlyItem(BaseModel):
    month: str
    revenue: float


class RevenueTrendResponse(BaseModel):
    labels: List[str]
    values: List[float]
