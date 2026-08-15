from pydantic import BaseModel, Field, field_validator
from typing import Optional


class AudienceCreate(BaseModel):
    creator_id: int
    age_group: str
    gender: str
    country: str
    city: str
    device_type: str
    active_hour: int = Field(..., ge=0, le=23)
    followers: int = 0
    impressions: int = 0
    reach: int = 0

    @field_validator("followers", "impressions", "reach")
    @classmethod
    def no_negative(cls, value):
        if value < 0:
            raise ValueError("Value cannot be negative")
        return value


class AudienceUpdate(BaseModel):
    age_group: Optional[str] = None
    gender: Optional[str] = None
    country: Optional[str] = None
    city: Optional[str] = None
    device_type: Optional[str] = None
    active_hour: Optional[int] = Field(None, ge=0, le=23)
    followers: Optional[int] = None
    impressions: Optional[int] = None
    reach: Optional[int] = None

    @field_validator("followers", "impressions", "reach")
    @classmethod
    def no_negative(cls, value):
        if value is not None and value < 0:
            raise ValueError("Value cannot be negative")
        return value


class AudienceOut(BaseModel):
    id: int
    creator_id: int
    age_group: str
    gender: str
    country: str
    city: str
    device_type: str
    active_hour: int
    followers: int
    impressions: int
    reach: int

    class Config:
        from_attributes = True