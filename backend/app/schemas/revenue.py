from datetime import date
from pydantic import BaseModel, Field, ConfigDict


class RevenueBase(BaseModel):
    source: str
    amount: float = Field(..., ge=0)
    currency: str = "INR"
    revenue_date: date
    description: str | None = None


class RevenueCreate(RevenueBase):
    creator_id: int


class RevenueUpdate(BaseModel):
    source: str | None = None
    amount: float | None = Field(default=None, ge=0)
    currency: str | None = None
    revenue_date: date | None = None
    description: str | None = None


class RevenueResponse(RevenueBase):
    id: int
    creator_id: int

    model_config = ConfigDict(from_attributes=True)