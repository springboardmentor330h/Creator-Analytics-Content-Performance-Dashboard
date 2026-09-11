from datetime import date
from decimal import Decimal
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field, model_validator


SponsorshipStatus = Literal[
    "active",
    "pending",
    "completed",
    "cancelled",
]

PaymentStatus = Literal[
    "pending",
    "paid",
    "unpaid",
    "overdue",
]


class SponsorshipBase(BaseModel):
    brand_name: str = Field(
        min_length=1,
        max_length=150,
    )

    campaign: str = Field(
        min_length=1,
        max_length=200,
    )

    contract_value: Decimal = Field(
        gt=0,
        max_digits=12,
        decimal_places=2,
    )

    start_date: date
    end_date: date

    status: SponsorshipStatus = "active"

    payment_status: PaymentStatus = "pending"

    @model_validator(mode="after")
    def validate_dates(self):
        if self.end_date < self.start_date:
            raise ValueError(
                "end_date must be on or after start_date"
            )

        return self


class SponsorshipCreate(SponsorshipBase):
    creator_id: int = Field(gt=0)


class SponsorshipUpdate(BaseModel):
    brand_name: str | None = Field(
        default=None,
        min_length=1,
        max_length=150,
    )

    campaign: str | None = Field(
        default=None,
        min_length=1,
        max_length=200,
    )

    contract_value: Decimal | None = Field(
        default=None,
        gt=0,
        max_digits=12,
        decimal_places=2,
    )

    start_date: date | None = None

    end_date: date | None = None

    status: SponsorshipStatus | None = None

    payment_status: PaymentStatus | None = None

    @model_validator(mode="after")
    def validate_dates(self):
        if (
            self.start_date is not None
            and self.end_date is not None
            and self.end_date < self.start_date
        ):
            raise ValueError(
                "end_date must be on or after start_date"
            )

        return self


class SponsorshipResponse(SponsorshipBase):
    id: int
    creator_id: int

    model_config = ConfigDict(
        from_attributes=True
    )