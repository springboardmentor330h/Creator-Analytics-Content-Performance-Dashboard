from typing import Optional

from pydantic import BaseModel, ConfigDict, Field


class AudienceCreate(BaseModel):
    creator_id: int
    platform: str

    age_group: Optional[str] = None
    gender: Optional[str] = None
    country: Optional[str] = None
    city: Optional[str] = None
    device: Optional[str] = None
    active_hour: Optional[int] = Field(default=None, ge=0, le=23)
    follower_count: int = Field(default=0, ge=0)


class AudienceUpdate(BaseModel):
    age_group: Optional[str] = None
    gender: Optional[str] = None
    country: Optional[str] = None
    city: Optional[str] = None
    device: Optional[str] = None
    active_hour: Optional[int] = Field(default=None, ge=0, le=23)
    follower_count: Optional[int] = Field(default=None, ge=0)


class AudienceResponse(BaseModel):
    id: int
    creator_id: int
    platform: str
    age_group: Optional[str] = None
    gender: Optional[str] = None
    country: Optional[str] = None
    city: Optional[str] = None
    device: Optional[str] = None
    active_hour: Optional[int] = None
    follower_count: int

    model_config = ConfigDict(from_attributes=True)
