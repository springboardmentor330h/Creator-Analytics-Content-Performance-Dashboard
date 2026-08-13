from sqlalchemy import Column, Integer, String, Float, Date
from app.database import Base


class AudienceData(Base):
    __tablename__ = "audience_data"

    id = Column(Integer, primary_key=True, index=True)
    creator_id = Column(Integer, nullable=False, index=True)
    platform = Column(String, nullable=False)

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
    top_device = Column(String, nullable=True)
    peak_active_hour = Column(Integer, nullable=True)

    recorded_date = Column(Date, nullable=False)