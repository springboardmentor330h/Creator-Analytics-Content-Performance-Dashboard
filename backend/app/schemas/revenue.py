from datetime import date
from typing import Optional
from pydantic import BaseModel, Field, ConfigDict

VALID_SOURCES = {
    "Sponsorship",
    "Ad Revenue",
    "Affiliate Marketing",
    "Brand Collaboration",
    "Subscription Revenue",
}


class RevenueBase(BaseModel):
    creator_id: int
    source: str = Field(..., min_length=1)
    amount: float = Field(..., ge=0)
    currency: str = Field("USD", min_length=1)
    description: Optional[str] = None
    date: date


class RevenueCreate(RevenueBase):
    pass


class RevenueUpdate(BaseModel):
    creator_id: Optional[int] = None
    source: Optional[str] = Field(None, min_length=1)
    amount: Optional[float] = Field(None, ge=0)
    currency: Optional[str] = Field(None, min_length=1)
    description: Optional[str] = None
    date: Optional[date] = None


class RevenueResponse(RevenueBase):
    id: int
    model_config = ConfigDict(from_attributes=True)