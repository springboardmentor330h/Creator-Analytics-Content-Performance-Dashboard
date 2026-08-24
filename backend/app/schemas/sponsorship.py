from datetime import date
from typing import Optional
from pydantic import BaseModel, Field, ConfigDict


class SponsorshipBase(BaseModel):
    creator_id: int
    brand_name: str = Field(..., min_length=1)
    campaign_name: str = Field(..., min_length=1)
    contract_value: float = Field(..., ge=0)
    start_date: date
    end_date: Optional[date] = None
    status: str = Field("active", min_length=1)
    payment_status: str = Field("pending", min_length=1)


class SponsorshipCreate(SponsorshipBase):
    pass


class SponsorshipUpdate(BaseModel):
    creator_id: Optional[int] = None
    brand_name: Optional[str] = Field(None, min_length=1)
    campaign_name: Optional[str] = Field(None, min_length=1)
    contract_value: Optional[float] = Field(None, ge=0)
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    status: Optional[str] = None
    payment_status: Optional[str] = None


class SponsorshipResponse(SponsorshipBase):
    id: int
    model_config = ConfigDict(from_attributes=True)