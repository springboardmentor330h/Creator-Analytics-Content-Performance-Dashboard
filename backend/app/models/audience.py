import uuid
from sqlalchemy import Column, Integer, Float, DateTime, ForeignKey, String
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from app.database import Base

class AudienceSnapshot(Base):
    """
    Stores a periodic snapshot of audience metrics for a user's channel.
    NOTE: Real demographic data (age/gender/location/device) requires the
    YouTube Analytics API with OAuth2 user consent — not available via a
    simple API key. Until OAuth is wired up, this table is populated with
    realistic simulated data so the module is fully functional end-to-end.
    """
    __tablename__ = "audience_snapshots"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    owner_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)

    followers = Column(Integer, default=0)
    new_followers = Column(Integer, default=0)
    impressions = Column(Integer, default=0)
    reach = Column(Integer, default=0)

    age_13_17 = Column(Float, default=0)
    age_18_24 = Column(Float, default=0)
    age_25_34 = Column(Float, default=0)
    age_35_44 = Column(Float, default=0)
    age_45_plus = Column(Float, default=0)

    male_pct = Column(Float, default=0)
    female_pct = Column(Float, default=0)
    other_pct = Column(Float, default=0)

    top_country = Column(String, nullable=True)
    top_device = Column(String, nullable=True)   # mobile / desktop / tablet
    peak_active_hour = Column(Integer, nullable=True)  # 0-23

    snapshot_date = Column(DateTime(timezone=True), server_default=func.now())