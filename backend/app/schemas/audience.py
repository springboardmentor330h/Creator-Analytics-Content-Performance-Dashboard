from typing import Optional
from pydantic import BaseModel, Field, ConfigDict


class AudienceBase(BaseModel):
    creator_id: int
    age_group: str = Field(..., min_length=1)
    gender: str = Field(..., min_length=1)
    country: str = Field(..., min_length=1)
    city: str = Field(..., min_length=1)
    device_type: str = Field(..., min_length=1)
    active_hour: int = Field(..., ge=0, le=23)
    followers: int = Field(..., ge=0)
    impressions: int = Field(..., ge=0)
    reach: int = Field(..., ge=0)


class AudienceCreate(AudienceBase):
    """Schema used when creating a new audience record (POST)."""
    pass


class AudienceUpdate(BaseModel):
    """Schema used when updating an audience record (PUT). All fields optional."""
    creator_id: Optional[int] = None
    age_group: Optional[str] = Field(None, min_length=1)
    gender: Optional[str] = Field(None, min_length=1)
    country: Optional[str] = Field(None, min_length=1)
    city: Optional[str] = Field(None, min_length=1)
    device_type: Optional[str] = Field(None, min_length=1)
    active_hour: Optional[int] = Field(None, ge=0, le=23)
    followers: Optional[int] = Field(None, ge=0)
    impressions: Optional[int] = Field(None, ge=0)
    reach: Optional[int] = Field(None, ge=0)


class AudienceResponse(AudienceBase):
    id: int
    model_config = ConfigDict(from_attributes=True)