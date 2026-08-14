from sqlalchemy import Column, Integer, String

from app.db.database import Base


class Audience(Base):
    __tablename__ = "audience"

    id = Column(Integer, primary_key=True, index=True)
    creator_id = Column(Integer, nullable=False)
    age_group = Column(String(50), nullable=False)
    gender = Column(String(50), nullable=False)
    country = Column(String(100), nullable=False)
    city = Column(String(100), nullable=False)
    device_type = Column(String(50), nullable=False)
    active_hour = Column(Integer, nullable=False)
    followers = Column(Integer, nullable=False)
    impressions = Column(Integer, nullable=False)
    reach = Column(Integer, nullable=False)
