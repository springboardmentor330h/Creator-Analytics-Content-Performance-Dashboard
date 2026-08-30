from pydantic import BaseModel, Field


class AudienceCreate(BaseModel):
    creator_id: int

    age_group: str
    gender: str

    country: str
    city: str

    device_type: str

    active_hour: int = Field(..., ge=0, le=23)

    followers: int = Field(default=0, ge=0)
    impressions: int = Field(default=0, ge=0)
    reach: int = Field(default=0, ge=0)


class AudienceUpdate(BaseModel):
    age_group: str | None = None
    gender: str | None = None

    country: str | None = None
    city: str | None = None

    device_type: str | None = None

    active_hour: int | None = Field(default=None, ge=0, le=23)

    followers: int | None = Field(default=None, ge=0)
    impressions: int | None = Field(default=None, ge=0)
    reach: int | None = Field(default=None, ge=0)