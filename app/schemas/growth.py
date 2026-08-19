from datetime import date
from typing import Optional
from pydantic import BaseModel, ConfigDict, Field


class GrowthBase(BaseModel):
    creator_id: int = Field(..., description="ID of the creator")
    date: date
    followers_count: int = Field(
        0, ge=0, description="Followers count cannot be negative"
    )
    engagement_rate: float = Field(
        0.0, ge=0.0, description="Engagement rate cannot be negative"
    )


class GrowthCreate(GrowthBase):
    pass


class GrowthUpdate(BaseModel):
    creator_id: Optional[int] = None
    date: Optional[date] = None
    followers_count: Optional[int] = Field(None, ge=0)
    engagement_rate: Optional[float] = Field(None, ge=0.0)


class GrowthResponse(GrowthBase):
    id: int

    model_config = ConfigDict(from_attributes=True)