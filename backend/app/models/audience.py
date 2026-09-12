"""
Audience models — two distinct tables, deliberately kept separate:

1. AudienceDemographic: a SNAPSHOT of who the audience is (age group,
   gender split, geography) at a point in time. Demographics change
   slowly, so these are recorded periodically (e.g. weekly/monthly),
   not per-request.

2. AudienceGrowth: a follower/subscriber COUNT at a point in time, one
   row per day/week/platform. This is what growth-rate and trend charts
   are built from — you need a time series of counts, not a single
   current number, to compute "growth".

WHY not one table? A demographic snapshot has many sub-fields (age
buckets, gender, country) that don't relate to a single point of growth
data. Merging them would mean mostly-empty rows either way.
"""
import enum
import uuid
from datetime import datetime, date

from sqlalchemy import Column, String, DateTime, Date, Enum, Integer, Float, ForeignKey
from sqlalchemy.orm import relationship

from app.db.session import Base
from app.db.types import GUID
from app.models.content import Platform


class AgeGroup(str, enum.Enum):
    age_13_17 = "13-17"
    age_18_24 = "18-24"
    age_25_34 = "25-34"
    age_35_44 = "35-44"
    age_45_54 = "45-54"
    age_55_plus = "55+"


class Gender(str, enum.Enum):
    male = "male"
    female = "female"
    other = "other"


class AudienceDemographic(Base):
    __tablename__ = "audience_demographics"

    id = Column(GUID(), primary_key=True, default=uuid.uuid4)
    creator_id = Column(GUID(), ForeignKey("users.id"), nullable=False, index=True)
    platform = Column(Enum(Platform), nullable=False)

    snapshot_date = Column(Date, nullable=False)

    age_group = Column(Enum(AgeGroup), nullable=False)
    gender = Column(Enum(Gender), nullable=False)
    country = Column(String(100), nullable=False)

    # percentage (0-100) of the audience in this specific
    # age_group + gender + country slice, as reported by the platform.
    percentage = Column(Float, nullable=False)

    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    creator = relationship("User", backref="audience_demographics")


class AudienceGrowth(Base):
    __tablename__ = "audience_growth"

    id = Column(GUID(), primary_key=True, default=uuid.uuid4)
    creator_id = Column(GUID(), ForeignKey("users.id"), nullable=False, index=True)
    platform = Column(Enum(Platform), nullable=False)

    record_date = Column(Date, nullable=False)
    follower_count = Column(Integer, nullable=False)

    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    creator = relationship("User", backref="audience_growth_records")
