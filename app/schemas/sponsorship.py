from datetime import date
from typing import Optional
from pydantic import BaseModel, ConfigDict, Field

class SponsorshipCreate(BaseModel):
    creator_id: int = Field(..., ge=1)
    brand_name: str
    campaign: str
    contract_value: float = Field(..., ge=0)
    start_date: date
    end_date: Optional[date] = None
    status: str = "active"
    payment_status: str = "pending"

class SponsorshipUpdate(BaseModel):
    brand_name: Optional[str] = None
    campaign: Optional[str] = None
    contract_value: Optional[float] = Field(None, ge=0)
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    status: Optional[str] = None
    payment_status: Optional[str] = None

class SponsorshipResponse(SponsorshipCreate):
    id: int
    model_config = ConfigDict(from_attributes=True)
