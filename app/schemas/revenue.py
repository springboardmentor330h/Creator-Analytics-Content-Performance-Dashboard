from datetime import date
from decimal import Decimal
from typing import Optional

from pydantic import BaseModel, Field, ConfigDict, field_validator


class RevenueBase(BaseModel):
    source: str
    amount: Decimal = Field(gt=0)
    currency: str = "INR"
    description: Optional[str] = None
    revenue_date: date

    @field_validator("source")
    @classmethod
    def validate_source(cls, value: str):
        allowed_sources = {
            "Sponsorship",
            "Ad Revenue",
            "Affiliate Marketing",
            "Brand Collaboration",
            "Subscription Revenue",
        }

        if value not in allowed_sources:
            raise ValueError(
                "Invalid revenue source. Allowed sources are: "
                "Sponsorship, Ad Revenue, Affiliate Marketing, "
                "Brand Collaboration, Subscription Revenue"
            )

        return value


class RevenueCreate(RevenueBase):
    pass


class RevenueUpdate(BaseModel):
    source: Optional[str] = None
    amount: Optional[Decimal] = Field(default=None, gt=0)
    currency: Optional[str] = None
    description: Optional[str] = None
    revenue_date: Optional[date] = None

    @field_validator("source")
    @classmethod
    def validate_source(cls, value: Optional[str]):
        if value is None:
            return value

        allowed_sources = {
            "Sponsorship",
            "Ad Revenue",
            "Affiliate Marketing",
            "Brand Collaboration",
            "Subscription Revenue",
        }

        if value not in allowed_sources:
            raise ValueError(
                "Invalid revenue source. Allowed sources are: "
                "Sponsorship, Ad Revenue, Affiliate Marketing, "
                "Brand Collaboration, Subscription Revenue"
            )

        return value


class RevenueResponse(RevenueBase):
    id: int
    creator_id: int

    model_config = ConfigDict(from_attributes=True)
