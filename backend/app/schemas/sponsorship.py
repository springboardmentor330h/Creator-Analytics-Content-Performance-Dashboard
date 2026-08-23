from pydantic import BaseModel, Field
from typing import Optional
from datetime import date

class SponsorshipCreate(BaseModel):
    creator_id: int
    brand_name: str = Field(..., min_length=2)
    campaign_name: str = Field(..., min_length=2)
    contract_value: float = Field(..., gt=0)
    start_date: date
    end_date: Optional[date] = None
    status: str = "active"
    payment_status: str = "pending"

class SponsorshipUpdate(BaseModel):
    brand_name: Optional[str] = Field(None, min_length=2)
    campaign_name: Optional[str] = Field(None, min_length=2)
    contract_value: Optional[float] = Field(None, gt=0)
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    status: Optional[str] = None
    payment_status: Optional[str] = None