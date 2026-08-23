from pydantic import BaseModel, Field
from typing import Optional
from datetime import date

VALID_SOURCES = ["Sponsorship", "Ad Revenue", "Affiliate Marketing", "Brand Collaboration", "Subscription"]

class RevenueCreate(BaseModel):
    creator_id: int
    source: str
    amount: float = Field(..., gt=0)
    description: Optional[str] = None
    date: date

class RevenueUpdate(BaseModel):
    source: Optional[str] = None
    amount: Optional[float] = Field(None, gt=0)
    description: Optional[str] = None
    date: Optional[date] = None