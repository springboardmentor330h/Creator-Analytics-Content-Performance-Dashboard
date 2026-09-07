from datetime import date
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field


class RevenueCreate(BaseModel):
    creator_id: int
    platform: str
    source: str
    amount: float = Field(ge=0)
    currency: str = "USD"
    record_date: date


class RevenueResponse(BaseModel):
    id: int
    creator_id: int
    platform: str
    source: str
    amount: float
    currency: str
    record_date: date

    model_config = ConfigDict(from_attributes=True)


class SponsorshipCreate(BaseModel):
    creator_id: int
    brand_name: str = Field(min_length=2)
    platform: str
    deal_amount: float = Field(ge=0)
    status: str = "Pending"
    start_date: Optional[date] = None
    end_date: Optional[date] = None


class SponsorshipUpdate(BaseModel):
    brand_name: Optional[str] = Field(default=None, min_length=2)
    deal_amount: Optional[float] = Field(default=None, ge=0)
    status: Optional[str] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None


class SponsorshipResponse(BaseModel):
    id: int
    creator_id: int
    brand_name: str
    platform: str
    deal_amount: float
    status: str
    start_date: Optional[date] = None
    end_date: Optional[date] = None

    model_config = ConfigDict(from_attributes=True)
