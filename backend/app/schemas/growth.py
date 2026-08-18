from pydantic import BaseModel, Field
from typing import Optional
from datetime import date


class GrowthCreate(BaseModel):
    creator_id: int
    date: date
    followers: int = Field(ge=0)
    reach: int = Field(ge=0)
    engagement_rate: float = Field(ge=0)


class GrowthUpdate(BaseModel):
    date: Optional[date] = None
    followers: Optional[int] = Field(default=None, ge=0)
    reach: Optional[int] = Field(default=None, ge=0)
    engagement_rate: Optional[float] = Field(default=None, ge=0)