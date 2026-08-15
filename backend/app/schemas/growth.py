from datetime import date
from typing import Optional
from pydantic import BaseModel, Field, ConfigDict


class GrowthBase(BaseModel):
    creator_id: int
    date: date
    followers: int = Field(..., ge=0)
    reach: int = Field(..., ge=0)
    engagement_rate: float = Field(..., ge=0)


class GrowthCreate(GrowthBase):
    """Schema used when creating a new growth record (POST)."""
    pass


class GrowthUpdate(BaseModel):
    """Schema used when updating a growth record (PUT). All fields optional."""
    creator_id: Optional[int] = None
    date: Optional[date] = None
    followers: Optional[int] = Field(None, ge=0)
    reach: Optional[int] = Field(None, ge=0)
    engagement_rate: Optional[float] = Field(None, ge=0)


class GrowthResponse(GrowthBase):
    id: int
    model_config = ConfigDict(from_attributes=True)