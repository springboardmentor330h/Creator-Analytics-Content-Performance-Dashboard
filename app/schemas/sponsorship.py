from datetime import date
from typing import Optional

from pydantic import BaseModel, Field


class SponsorshipCreate(BaseModel):
    creator_id: int = Field(..., gt=0)

    brand_name: str = Field(
        ...,
        min_length=2,
        max_length=150
    )

    campaign: str = Field(
        ...,
        min_length=2,
        max_length=255
    )

    contract_value: float = Field(
        ...,
        ge=0
    )

    start_date: date
    end_date: date

    status: str = Field(
        "Active",
        min_length=2,
        max_length=50
    )

    payment_status: str = Field(
        "Pending",
        min_length=2,
        max_length=50
    )


class SponsorshipUpdate(BaseModel):
    brand_name: Optional[str] = Field(
        None,
        min_length=2,
        max_length=150
    )

    campaign: Optional[str] = Field(
        None,
        min_length=2,
        max_length=255
    )

    contract_value: Optional[float] = Field(
        None,
        ge=0
    )

    start_date: Optional[date] = None
    end_date: Optional[date] = None

    status: Optional[str] = Field(
        None,
        min_length=2,
        max_length=50
    )

    payment_status: Optional[str] = Field(
        None,
        min_length=2,
        max_length=50
    )
