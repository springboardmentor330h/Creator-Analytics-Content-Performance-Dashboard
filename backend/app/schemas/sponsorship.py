from pydantic import BaseModel, Field
from typing import Optional, Literal
from datetime import date

StatusType = Literal["active", "completed", "cancelled"]
PaymentStatusType = Literal["pending", "paid", "overdue"]


class SponsorshipCreate(BaseModel):
    creator_id: int
    brand_name: str = Field(..., min_length=2)
    campaign_name: str = Field(..., min_length=2)
    contract_value: float = Field(..., gt=0)
    start_date: date
    end_date: Optional[date] = None
    status: StatusType = "active"
    payment_status: PaymentStatusType = "pending"


class SponsorshipUpdate(BaseModel):
    brand_name: Optional[str] = None
    campaign_name: Optional[str] = None
    contract_value: Optional[float] = Field(None, gt=0)
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    status: Optional[StatusType] = None
    payment_status: Optional[PaymentStatusType] = None


class SponsorshipOut(BaseModel):
    id: int
    creator_id: int
    brand_name: str
    campaign_name: str
    contract_value: float
    start_date: date
    end_date: Optional[date]
    status: str
    payment_status: str

    class Config:
        from_attributes = True