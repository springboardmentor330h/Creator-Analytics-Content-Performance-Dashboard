from pydantic import BaseModel, Field
from typing import Optional
from datetime import date

class GrowthCreate(BaseModel):
    creator_id: int
    date: date
    followers: int = Field(0, ge=0)
    reach: int = Field(0, ge=0)
    engagement_rate: float = Field(0.0, ge=0)

class GrowthUpdate(BaseModel):
    creator_id: Optional[int] = None
    date: Optional[date] = None
    followers: Optional[int] = Field(None, ge=0)
    reach: Optional[int] = Field(None, ge=0)
    engagement_rate: Optional[float] = Field(None, ge=0)