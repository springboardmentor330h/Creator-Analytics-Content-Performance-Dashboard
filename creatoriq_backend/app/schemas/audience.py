from typing import Dict, List, Optional
from pydantic import BaseModel, ConfigDict, Field, field_validator


class AudienceCreate(BaseModel):
    creator_id: Optional[int] = None
    age_group: str = Field(..., min_length=1)
    gender: str = Field(..., min_length=1)
    country: str = Field(..., min_length=1)
    city: str = Field(..., min_length=1)
    device_type: str = Field(..., min_length=1)
    active_hour: int = Field(..., ge=0, le=23)
    followers: int = Field(..., ge=0)
    impressions: int = Field(..., ge=0)
    reach: int = Field(..., ge=0)

    @field_validator('age_group', 'gender', 'country', 'city', 'device_type')
    @classmethod
    def strip_strings(cls, v: str) -> str:
        if isinstance(v, str):
            cleaned = v.strip()
            if not cleaned:
                raise ValueError('Field cannot be empty')
            return cleaned
        return v


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

    @field_validator('age_group', 'gender', 'country', 'city', 'device_type')
    @classmethod
    def strip_optional_strings(cls, v: Optional[str]) -> Optional[str]:
        if v is None:
            return v
        cleaned = v.strip()
        if not cleaned:
            raise ValueError('Field cannot be empty')
        return cleaned


class AudienceResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

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


class AudienceAnalyticsResponse(BaseModel):
    total_followers: int = 0
    total_reach: int = 0
    total_impressions: int = 0
    gender_distribution: Dict[str, float] = {}
    age_distribution: Dict[str, float] = {}
    top_countries: List[str] = []
    top_cities: List[str] = []
    device_distribution: Dict[str, float] = {}
