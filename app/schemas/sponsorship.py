from pydantic import BaseModel, field_validator
from datetime import date
from typing import Optional

from app.schemas.revenue import RevenueBase

from app.schemas.revenue import RevenueBase

class SponsorshipBase(BaseModel):
    creator_id: int
    sponsor_name: str
    amount: float
    description: Optional[str] = None
    start_date: date
    end_date: Optional[date] = None
    payment_status: str

    @field_validator("payment_status")
    def lowercase_payment_status(cls, v: str) -> str:
        return v.lower()

class SponsorshipCreate(SponsorshipBase):
    pass

class SponsorshipUpdate(BaseModel):
    sponsor_name: Optional[str] = None
    amount: Optional[float] = None
    description: Optional[str] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    payment_status: Optional[str] = None

    @field_validator("payment_status")
    def lowercase_payment_status(cls, v: Optional[str]) -> Optional[str]:
        return v.lower() if v else v

class SponsorshipResponse(SponsorshipBase):
    id: int

    class Config:
        from_attributes = True