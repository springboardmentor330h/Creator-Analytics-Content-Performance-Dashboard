from datetime import date
from decimal import Decimal

from pydantic import BaseModel, ConfigDict, Field


class RevenueBase(BaseModel):
    source: str
    amount: Decimal = Field(gt=0)
    revenue_date: date
    description: str | None = None
    sponsorship_id: int | None = Field(default=None, gt=0)


class RevenueCreate(RevenueBase):
    creator_id: int = Field(gt=0)


class RevenueUpdate(BaseModel):
    source: str | None = None
    amount: Decimal | None = Field(default=None, gt=0)
    revenue_date: date | None = None
    description: str | None = None
    sponsorship_id: int | None = Field(default=None, gt=0)


class RevenueResponse(RevenueBase):
    id: int
    creator_id: int

    model_config = ConfigDict(from_attributes=True)