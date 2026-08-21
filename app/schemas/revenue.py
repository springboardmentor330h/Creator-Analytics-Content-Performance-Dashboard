from pydantic import BaseModel, field_validator
from datetime import date
from typing import Optional

class RevenueBase(BaseModel):
    creator_id: int
    amount: float
    source: str
    description: Optional[str] = None
    earned_date: date

    @field_validator("source")
    def lowercase_source(cls, v: str) -> str:
        return v.lower()

class RevenueCreate(RevenueBase):
    pass

class RevenueUpdate(BaseModel):
    amount: Optional[float] = None
    source: Optional[str] = None
    description: Optional[str] = None
    earned_date: Optional[date] = None

    @field_validator("source")
    def lowercase_source(cls, v: Optional[str]) -> Optional[str]:
        return v.lower() if v else v

class RevenueResponse(RevenueBase):
    id: int

    class Config:
        from_attributes = True