from datetime import date
from pydantic import BaseModel, ConfigDict


class SponsorshipBase(BaseModel):
    brand_name: str
    campaign: str
    contract_value: float
    start_date: date
    end_date: date
    status: str = "Active"
    payment_status: str = "Pending"


class SponsorshipCreate(SponsorshipBase):
    pass


class SponsorshipUpdate(BaseModel):
    brand_name: str | None = None
    campaign: str | None = None
    contract_value: float | None = None
    start_date: date | None = None
    end_date: date | None = None
    status: str | None = None
    payment_status: str | None = None


class SponsorshipResponse(SponsorshipBase):
    id: int
    creator_id: int

    model_config = ConfigDict(from_attributes=True)
