from datetime import date
from typing import Optional

from pydantic import BaseModel, Field


class GrowthCreate(BaseModel):
    creator_id: int
    date: date
    followers: int = Field(..., ge=0)
    reach: int = Field(..., ge=0)
    engagement_rate: float = Field(..., ge=0)


class GrowthUpdate(BaseModel):
    creator_id: Optional[int] = None
    date: Optional[date] = None
    followers: Optional[int] = Field(None, ge=0)
    reach: Optional[int] = Field(None, ge=0)
    engagement_rate: Optional[float] = Field(None, ge=0)
