from pydantic import BaseModel, Field
from typing import Optional
import datetime


class SponsorshipBase(BaseModel):
    brand_name: str = Field(..., min_length=1, description="Brand name sponsoring the content")
    campaign_name: str = Field(..., min_length=1, description="Campaign title or description")
    contract_value: float = Field(..., gt=0, description="Agreed total deal value")
    start_date: datetime.date = Field(..., description="Campaign start date")
    end_date: Optional[datetime.date] = Field(None, description="Campaign completion date")
    status: str = Field("Active", description="Deal status: Pending, Active, Completed, Cancelled")
    payment_status: str = Field("Unpaid", description="Payment status: Unpaid, Paid, Pending, Processing")
    notes: Optional[str] = Field(None, description="Internal notes or terms")


class SponsorshipCreate(SponsorshipBase):
    pass


class SponsorshipUpdate(BaseModel):
    brand_name: Optional[str] = None
    campaign_name: Optional[str] = None
    contract_value: Optional[float] = Field(None, gt=0)
    start_date: Optional[datetime.date] = None
    end_date: Optional[datetime.date] = None
    status: Optional[str] = None
    payment_status: Optional[str] = None
    notes: Optional[str] = None


class SponsorshipResponse(SponsorshipBase):
    id: int
    creator_id: int
    created_at: Optional[datetime.datetime] = None

    class Config:
        from_attributes = True
