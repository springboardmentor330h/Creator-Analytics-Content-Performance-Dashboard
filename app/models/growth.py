from sqlalchemy import Column, Integer, Date, Float

from app.db.database import Base


class Growth(Base):
    __tablename__ = "growth"

    id = Column(Integer, primary_key=True, index=True)
    creator_id = Column(Integer, nullable=False)
    date = Column(Date, nullable=False)
    followers = Column(Integer, nullable=False)
    reach = Column(Integer, nullable=False)
    engagement_rate = Column(Float, nullable=False)
