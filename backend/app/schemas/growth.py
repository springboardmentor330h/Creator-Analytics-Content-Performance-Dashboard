from datetime import date
from pydantic import BaseModel, Field


class GrowthCreate(BaseModel):
    creator_id: int
    date: date

    followers: int = Field(default=0, ge=0)

    reach: int = Field(default=0, ge=0)

    engagement_rate: float = Field(default=0.0, ge=0)


class GrowthUpdate(BaseModel):
    date: date | None = None

    followers: int | None = Field(default=None, ge=0)

    reach: int | None = Field(default=None, ge=0)

    engagement_rate: float | None = Field(
        default=None,
        ge=0
    )