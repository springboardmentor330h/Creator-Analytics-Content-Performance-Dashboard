from pydantic import BaseModel, Field, field_validator
from typing import Optional
from datetime import date


class AudienceCreate(BaseModel):
    creator_id: int
    platform: str
    followers: int = 0
    new_followers: int = 0
    impressions: int = 0
    reach: int = 0
    age_13_17: float = 0
    age_18_24: float = 0
    age_25_34: float = 0
    age_35_44: float = 0
    age_45_plus: float = 0
    male_pct: float = 0
    female_pct: float = 0
    other_pct: float = 0
    top_country: Optional[str] = None
    top_device: Optional[str] = None
    peak_active_hour: Optional[int] = Field(None, ge=0, le=23)
    recorded_date: date

    @field_validator("followers", "new_followers", "impressions", "reach")
    @classmethod
    def no_negative_ints(cls, value):
        if value < 0:
            raise ValueError("Value cannot be negative")
        return value

    @field_validator("age_13_17", "age_18_24", "age_25_34", "age_35_44",
                      "age_45_plus", "male_pct", "female_pct", "other_pct")
    @classmethod
    def percent_range(cls, value):
        if value < 0 or value > 100:
            raise ValueError("Percentage must be between 0 and 100")
        return value


class AudienceUpdate(BaseModel):
    followers: Optional[int] = None
    new_followers: Optional[int] = None
    impressions: Optional[int] = None
    reach: Optional[int] = None
    age_13_17: Optional[float] = None
    age_18_24: Optional[float] = None
    age_25_34: Optional[float] = None
    age_35_44: Optional[float] = None
    age_45_plus: Optional[float] = None
    male_pct: Optional[float] = None
    female_pct: Optional[float] = None
    other_pct: Optional[float] = None
    top_country: Optional[str] = None
    top_device: Optional[str] = None
    peak_active_hour: Optional[int] = Field(None, ge=0, le=23)
    recorded_date: Optional[date] = None


class AudienceOut(BaseModel):
    id: int
    creator_id: int
    platform: str
    followers: int
    new_followers: int
    impressions: int
    reach: int
    age_13_17: float
    age_18_24: float
    age_25_34: float
    age_35_44: float
    age_45_plus: float
    male_pct: float
    female_pct: float
    other_pct: float
    top_country: Optional[str]
    top_device: Optional[str]
    peak_active_hour: Optional[int]
    recorded_date: date

    class Config:
        from_attributes = True