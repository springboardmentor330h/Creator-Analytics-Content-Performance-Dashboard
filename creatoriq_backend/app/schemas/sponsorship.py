from datetime import date, datetime
from typing import Literal, Optional
from pydantic import BaseModel, ConfigDict, Field, field_serializer, field_validator, model_validator

SponsorshipStatus = Literal["Draft", "Active", "Completed", "Cancelled"]
PaymentStatus = Literal["Pending", "Partially Paid", "Paid", "Overdue"]


class SponsorshipCreate(BaseModel):
    brand_name: str = Field(min_length=1, max_length=150)
    campaign_name: str = Field(min_length=1, max_length=150)
    contract_value: float = Field(ge=0, description="Contract value, must be non-negative")
    currency: str = Field(default="INR", min_length=1, max_length=10)
    start_date: date
    end_date: date
    status: SponsorshipStatus = "Draft"
    payment_status: PaymentStatus = "Pending"
    description: Optional[str] = None

    @field_validator("brand_name", "campaign_name")
    @classmethod
    def strip_and_validate_non_empty(cls, value: str) -> str:
        cleaned = value.strip()
        if not cleaned:
            raise ValueError("Field cannot be empty or whitespace only")
        return cleaned

    @field_validator("currency")
    @classmethod
    def validate_currency(cls, value: str) -> str:
        cleaned = value.strip().upper()
        if not cleaned:
            raise ValueError("currency cannot be empty")
        return cleaned

    @model_validator(mode="after")
    def validate_date_range(self) -> "SponsorshipCreate":
        if self.start_date and self.end_date and self.end_date < self.start_date:
            raise ValueError("end_date cannot be earlier than start_date")
        return self


class SponsorshipUpdate(BaseModel):
    brand_name: Optional[str] = Field(default=None, min_length=1, max_length=150)
    campaign_name: Optional[str] = Field(default=None, min_length=1, max_length=150)
    contract_value: Optional[float] = Field(default=None, ge=0)
    currency: Optional[str] = Field(default=None, min_length=1, max_length=10)
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    status: Optional[SponsorshipStatus] = None
    payment_status: Optional[PaymentStatus] = None
    description: Optional[str] = None

    @field_validator("brand_name", "campaign_name")
    @classmethod
    def strip_and_validate_non_empty(cls, value: Optional[str]) -> Optional[str]:
        if value is None:
            return value
        cleaned = value.strip()
        if not cleaned:
            raise ValueError("Field cannot be empty or whitespace only")
        return cleaned

    @field_validator("currency")
    @classmethod
    def validate_currency(cls, value: Optional[str]) -> Optional[str]:
        if value is None:
            return value
        cleaned = value.strip().upper()
        if not cleaned:
            raise ValueError("currency cannot be empty")
        return cleaned

    @model_validator(mode="after")
    def validate_date_range(self) -> "SponsorshipUpdate":
        if self.start_date is not None and self.end_date is not None and self.end_date < self.start_date:
            raise ValueError("end_date cannot be earlier than start_date")
        return self


class SponsorshipResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    creator_id: int
    brand_name: str
    campaign_name: str
    contract_value: float
    currency: str
    start_date: date
    end_date: date
    status: str
    payment_status: str
    description: Optional[str] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    @field_serializer("created_at", "updated_at")
    def serialize_datetimes(self, value: Optional[datetime]) -> Optional[str]:
        return value.isoformat() if value is not None else None


class SponsorshipSummaryResponse(BaseModel):
    total_sponsorships: int
    total_contract_value: float
    active_sponsorships: int
    completed_sponsorships: int
    pending_payments: int
