from sqlalchemy import Column, Integer, String
from backend.app.db.database import Base


class Audience(Base):
    __tablename__ = "audience"

    id = Column(Integer, primary_key=True, index=True)
    creator_id = Column(Integer, nullable=False, index=True)
    age_group = Column(String, nullable=True)
    gender = Column(String, nullable=True)
    country = Column(String, nullable=True)
    city = Column(String, nullable=True)
    device_type = Column(String, nullable=True)
    active_hour = Column(Integer, nullable=True)
    followers = Column(Integer, default=0)
    impressions = Column(Integer, default=0)
    reach = Column(Integer, default=0)
