from pydantic import BaseModel
from datetime import date
from typing import Optional


class SponsorshipCreate(BaseModel):
    creator_id: int
    brand_name: str
    campaign_name: str
    amount: float
    status: str = "Pending"
    start_date: date
    end_date: Optional[date] = None


class SponsorshipUpdate(BaseModel):
    brand_name: Optional[str] = None
    campaign_name: Optional[str] = None
    amount: Optional[float] = None
    status: Optional[str] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None


class SponsorshipResponse(BaseModel):
    id: int
    creator_id: int
    brand_name: str
    campaign_name: str
    amount: float
    status: str
    start_date: date
    end_date: Optional[date] = None

    class Config:
        from_attributes = True