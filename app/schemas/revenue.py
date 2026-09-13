from datetime import date
from typing import Optional
from pydantic import BaseModel, ConfigDict, Field

REVENUE_SOURCES = ["Sponsorships", "Ad Revenue", "Affiliate Marketing", "Brand Collaborations", "Subscription Revenue"]

class RevenueCreate(BaseModel):
    creator_id: int = Field(..., ge=1)
    source: str
    amount: float = Field(..., ge=0)
    currency: str = "INR"
    received_date: date
    description: Optional[str] = None

class RevenueUpdate(BaseModel):
    source: Optional[str] = None
    amount: Optional[float] = Field(None, ge=0)
    currency: Optional[str] = None
    received_date: Optional[date] = None
    description: Optional[str] = None

class RevenueResponse(RevenueCreate):
    id: int
    model_config = ConfigDict(from_attributes=True)
