from sqlalchemy import Column, Integer, Float, Date
from app.database import Base


class Growth(Base):
    """
    Stores daily historical analytics data (followers, reach, engagement
    rate) for a creator, used to compute growth trends over time.
    """
    __tablename__ = "growth"

    id = Column(Integer, primary_key=True, index=True)
    creator_id = Column(Integer, nullable=False, index=True)
    date = Column(Date, nullable=False)
    followers = Column(Integer, nullable=False, default=0)
    reach = Column(Integer, nullable=False, default=0)
    engagement_rate = Column(Float, nullable=False, default=0)