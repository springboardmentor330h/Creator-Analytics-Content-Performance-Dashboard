from sqlalchemy import Column, Integer, Float, Date
from app.db.database import Base


class Growth(Base):
    __tablename__ = "growth"

    id = Column(Integer, primary_key=True, index=True)

    creator_id = Column(Integer, nullable=False)

    date = Column(Date, nullable=False)

    followers = Column(Integer, default=0, nullable=False)

    reach = Column(Integer, default=0, nullable=False)

    engagement_rate = Column(Float, default=0.0, nullable=False)