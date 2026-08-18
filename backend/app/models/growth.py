from sqlalchemy import Column, Integer, Float, Date, String
from backend.app.db.database import Base


class Growth(Base):
    __tablename__ = "growth"

    id = Column(Integer, primary_key=True, index=True)
    creator_id = Column(Integer, nullable=False, index=True)
    platform = Column(String, default="All", nullable=True)
    date = Column(Date, nullable=False)
    followers = Column(Integer, default=0)
    reach = Column(Integer, default=0)
    engagement_rate = Column(Float, default=0.0)

