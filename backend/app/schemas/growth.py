from pydantic import BaseModel, Field
from datetime import date
from typing import Optional


class GrowthCreate(BaseModel):
    creator_id: int
    date: date
    followers: int = Field(0, ge=0)
    reach: int = Field(0, ge=0)
    engagement_rate: float = Field(0.0, ge=0.0)


class GrowthUpdate(BaseModel):
    creator_id: Optional[int] = None
    date: Optional[date] = None
    followers: Optional[int] = Field(None, ge=0)
    reach: Optional[int] = Field(None, ge=0)
    engagement_rate: Optional[float] = Field(None, ge=0.0)


class GrowthResponse(BaseModel):
    id: int
    creator_id: int
    date: date
    followers: int = 0
    reach: int = 0
    engagement_rate: float = 0.0

    model_config = {
        "from_attributes": True
    }
