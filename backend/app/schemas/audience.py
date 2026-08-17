from pydantic import BaseModel, Field
from typing import Optional

class AudienceCreate(BaseModel):
    creator_id: int
    age_group: str
    gender: str
    country: str
    city: str
    device_type: str
    active_hour: int = Field(..., ge=0, le=23)
    followers: int = Field(0, ge=0)
    impressions: int = Field(0, ge=0)
    reach: int = Field(0, ge=0)

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