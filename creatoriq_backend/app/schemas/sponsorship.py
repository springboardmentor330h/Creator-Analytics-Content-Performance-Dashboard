from datetime import date
from enum import Enum
from typing import Optional

from pydantic import BaseModel, Field, model_validator


class SponsorshipStatusEnum(str, Enum):
    PENDING = "pending"
    ACTIVE = "active"
    COMPLETED = "completed"
    CANCELLED = "cancelled"


class PaymentStatusEnum(str, Enum):
    UNPAID = "unpaid"
    PARTIAL = "partial"
    PAID = "paid"


class SponsorshipCreate(BaseModel):
    # creator_id is derived from the authenticated user, not
    # accepted from the client — see RevenueCreate for the same reasoning.
    brand_name: str = Field(..., min_length=2, max_length=150)
    campaign_name: str = Field(..., min_length=2, max_length=150)
    contract_value: float = Field(..., ge=0)
    start_date: date
    end_date: Optional[date] = None
    status: SponsorshipStatusEnum = SponsorshipStatusEnum.PENDING
    payment_status: PaymentStatusEnum = PaymentStatusEnum.UNPAID

    @model_validator(mode="after")
    def validate_dates(self):
        if self.end_date and self.end_date < self.start_date:
            raise ValueError("end_date cannot be before start_date")
        return self


class SponsorshipUpdate(BaseModel):
    brand_name: Optional[str] = Field(None, min_length=2, max_length=150)
    campaign_name: Optional[str] = Field(None, min_length=2, max_length=150)
    contract_value: Optional[float] = Field(None, ge=0)
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    status: Optional[SponsorshipStatusEnum] = None
    payment_status: Optional[PaymentStatusEnum] = None


class SponsorshipResponse(BaseModel):
    id: int
    creator_id: int
    brand_name: str
    campaign_name: str
    contract_value: float
    start_date: date
    end_date: Optional[date] = None
    status: str
    payment_status: str

    class Config:
        from_attributes = True