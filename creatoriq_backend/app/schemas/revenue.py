from datetime import date
from decimal import Decimal

from pydantic import BaseModel, ConfigDict


class RevenueBase(BaseModel):
    source: str
    amount: Decimal
    revenue_date: date
    description: str | None = None


class RevenueCreate(RevenueBase):
    creator_id: int


class RevenueUpdate(BaseModel):
    source: str | None = None
    amount: Decimal | None = None
    revenue_date: date | None = None
    description: str | None = None


class RevenueResponse(RevenueBase):
    id: int
    creator_id: int

    model_config = ConfigDict(from_attributes=True)