from typing import Optional
from pydantic import BaseModel, ConfigDict, Field


class AudienceBase(BaseModel):
    creator_id: int
    age_group: str
    gender: str
    country: str
    city: str
    device_type: str
    active_hour: int = Field(
        ..., ge=0, le=23, description="Active hour must be between 0 and 23"
    )
    followers: int = Field(
        ..., ge=0, description="Followers cannot be negative"
    )
    impressions: int = Field(
        ..., ge=0, description="Impressions cannot be negative"
    )
    reach: int = Field(..., ge=0, description="Reach cannot be negative")


class AudienceCreate(AudienceBase):
    pass


class AudienceUpdate(BaseModel):
    creator_id: Optional[int] = None
    age_group: Optional[str] = None
    gender: Optional[str] = None
    country: Optional[str] = None
    city: Optional[str] = None
    device_type: Optional[str] = None
    active_hour: Optional[int] = Field(None, ge=0, le=23)
    followers: Optional[int] = Field(None, ge=0)
    impressions: Optional[int] = Field(None, ge=0)
    reach: Optional[int] = Field(None, ge=0)


class AudienceResponse(AudienceBase):
    id: int

    model_config = ConfigDict(from_attributes=True)