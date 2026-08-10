from pydantic import BaseModel
from typing import Optional
from datetime import datetime
import uuid

class AudienceSnapshotOut(BaseModel):
    id: uuid.UUID
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
    snapshot_date: datetime

    class Config:
        from_attributes = True