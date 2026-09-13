from datetime import date
from typing import Optional
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field


class GrowthCreate(BaseModel):
    creator_id: UUID

    date: date

    followers: int = Field(0, ge=0)
    reach: int = Field(0, ge=0)
    engagement_rate: float = Field(0, ge=0)


class GrowthUpdate(BaseModel):
    date: Optional[date] = None

    followers: Optional[int] = Field(None, ge=0)
    reach: Optional[int] = Field(None, ge=0)
    engagement_rate: Optional[float] = Field(None, ge=0)


class GrowthResponse(GrowthCreate):
    id: UUID

    model_config = ConfigDict(from_attributes=True)
