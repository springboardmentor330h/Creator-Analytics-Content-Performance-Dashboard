from datetime import date
from decimal import Decimal

from pydantic import BaseModel, ConfigDict


class SponsorshipBase(BaseModel):
    brand_name: str
    campaign: str
    contract_value: Decimal
    start_date: date
    end_date: date
    status: str = "active"
    payment_status: str = "pending"


class SponsorshipCreate(SponsorshipBase):
    creator_id: int


class SponsorshipUpdate(BaseModel):
    brand_name: str | None = None
    campaign: str | None = None
    contract_value: Decimal | None = None
    start_date: date | None = None
    end_date: date | None = None
    status: str | None = None
    payment_status: str | None = None


class SponsorshipResponse(SponsorshipBase):
    id: int
    creator_id: int

    model_config = ConfigDict(from_attributes=True)