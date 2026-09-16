from datetime import date

from pydantic import BaseModel, ConfigDict, Field


class GrowthCreate(BaseModel):
    creator_id: int
    platform: str
    record_date: date
    follower_count: int = Field(default=0, ge=0)
    new_followers: int = Field(default=0, ge=0)
    unfollows: int = Field(default=0, ge=0)


class GrowthResponse(BaseModel):
    id: int
    creator_id: int
    platform: str
    record_date: date
    follower_count: int
    new_followers: int
    unfollows: int

    model_config = ConfigDict(from_attributes=True)
