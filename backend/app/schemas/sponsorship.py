from pydantic import BaseModel,Field
from datetime import date, datetime
from typing import Optional


class SponsorshipCreate(BaseModel):
    creator_id: int
    brand_name: str
    campaign: str
    contract_value: float
    start_date: date
    end_date: date
    status: str = "Active"
    payment_status: str = "Pending"


class SponsorshipUpdate(BaseModel):
    brand_name: Optional[str] = None
    campaign: Optional[str] = None
    contract_value: Optional[float] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    status: Optional[str] = None
    payment_status: Optional[str] = None


class SponsorshipResponse(BaseModel):
    id: int
    creator_id: int
    brand_name: str
    campaign: str
    contract_value: float = Field(gt=0)
    start_date: date
    end_date: date
    status: str
    payment_status: str
    created_at: datetime

    class Config:
        from_attributes = True