from datetime import date
from typing import Optional

from pydantic import BaseModel, Field


class RevenueCreate(BaseModel):
    source: str
    amount: float = Field(gt=0)
    currency: str = "INR"
    description: Optional[str] = None
    revenue_date: date


class RevenueUpdate(BaseModel):
    source: Optional[str] = None
    amount: Optional[float] = Field(default=None, gt=0)
    currency: Optional[str] = None
    description: Optional[str] = None
    revenue_date: Optional[date] = None


class RevenueResponse(BaseModel):
    id: int
    creator_id: int
    source: str
    amount: float
    currency: str
    description: Optional[str]
    revenue_date: date

    class Config:
        from_attributes = True