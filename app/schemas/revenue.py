from datetime import date

from pydantic import BaseModel, ConfigDict, Field


class RevenueBase(BaseModel):
    source: str
    amount: float = Field(..., gt=0)
    description: str | None = None
    revenue_date: date


class RevenueCreate(RevenueBase):
    pass


class RevenueUpdate(BaseModel):
    source: str | None = None
    amount: float | None = Field(default=None, gt=0)
    description: str | None = None
    revenue_date: date | None = None


class RevenueResponse(RevenueBase):
    id: int
    creator_id: int

    model_config = ConfigDict(from_attributes=True)