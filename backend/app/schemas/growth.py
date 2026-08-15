from pydantic import BaseModel, field_validator
from typing import Optional
from datetime import date


class GrowthCreate(BaseModel):
    creator_id: int
    date: date
    followers: int = 0
    reach: int = 0
    engagement_rate: float = 0

    @field_validator("followers", "reach", "engagement_rate")
    @classmethod
    def no_negative(cls, value):
        if value < 0:
            raise ValueError("Value cannot be negative")
        return value


class GrowthUpdate(BaseModel):
    date: Optional[date] = None
    followers: Optional[int] = None
    reach: Optional[int] = None
    engagement_rate: Optional[float] = None


class GrowthOut(BaseModel):
    id: int
    creator_id: int
    date: date
    followers: int
    reach: int
    engagement_rate: float

    class Config:
        from_attributes = True