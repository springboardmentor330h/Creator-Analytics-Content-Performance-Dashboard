from datetime import date
from decimal import Decimal
from typing import Optional

from pydantic import BaseModel, Field, ConfigDict, field_validator


class SponsorshipBase(BaseModel):
    brand_name: str
    campaign: str
    contract_value: Decimal = Field(gt=0)
    start_date: date
    end_date: date
    status: str = "Active"
    payment_status: str = "Pending"

    @field_validator("status")
    @classmethod
    def validate_status(cls, value: str):
        allowed_statuses = {
            "Active",
            "Completed",
            "Cancelled"
        }

        if value not in allowed_statuses:
            raise ValueError(
                "Invalid status. Allowed statuses are: "
                "Active, Completed, Cancelled"
            )

        return value

    @field_validator("payment_status")
    @classmethod
    def validate_payment_status(cls, value: str):
        allowed_payment_statuses = {
            "Pending",
            "Paid",
            "Partially Paid"
        }

        if value not in allowed_payment_statuses:
            raise ValueError(
                "Invalid payment status. Allowed payment statuses are: "
                "Pending, Paid, Partially Paid"
            )

        return value

    @field_validator("end_date")
    @classmethod
    def validate_dates(cls, value, info):
        start_date = info.data.get("start_date")

        if start_date and value < start_date:
            raise ValueError(
                "End date cannot be before start date"
            )

        return value


class SponsorshipCreate(SponsorshipBase):
    pass


class SponsorshipUpdate(BaseModel):
    brand_name: Optional[str] = None
    campaign: Optional[str] = None
    contract_value: Optional[Decimal] = Field(
        default=None,
        gt=0
    )
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    status: Optional[str] = None
    payment_status: Optional[str] = None

    @field_validator("status")
    @classmethod
    def validate_status(cls, value: Optional[str]):
        if value is None:
            return value

        allowed_statuses = {
            "Active",
            "Completed",
            "Cancelled"
        }

        if value not in allowed_statuses:
            raise ValueError(
                "Invalid status. Allowed statuses are: "
                "Active, Completed, Cancelled"
            )

        return value

    @field_validator("payment_status")
    @classmethod
    def validate_payment_status(cls, value: Optional[str]):
        if value is None:
            return value

        allowed_payment_statuses = {
            "Pending",
            "Paid",
            "Partially Paid"
        }

        if value not in allowed_payment_statuses:
            raise ValueError(
                "Invalid payment status. Allowed payment statuses are: "
                "Pending, Paid, Partially Paid"
            )

        return value


class SponsorshipResponse(SponsorshipBase):
    id: int
    creator_id: int

    model_config = ConfigDict(from_attributes=True)