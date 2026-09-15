from sqlalchemy import Column, Integer, String
from app.db.database import Base


class Audience(Base):
    __tablename__ = "audience"

    id = Column(Integer, primary_key=True, index=True)

    creator_id = Column(Integer, nullable=False)

    age_group = Column(String, nullable=False)
    gender = Column(String, nullable=False)

    country = Column(String, nullable=False)
    city = Column(String, nullable=False)

    device_type = Column(String, nullable=False)
    active_hour = Column(Integer, nullable=False)

    followers = Column(Integer, default=0, nullable=False)
    impressions = Column(Integer, default=0, nullable=False)
    reach = Column(Integer, default=0, nullable=False)