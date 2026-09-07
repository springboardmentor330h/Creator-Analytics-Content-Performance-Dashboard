from datetime import date as date_type

from sqlalchemy import Column, Date, Integer, String

from app.db.database import Base


class Growth(Base):
    """Daily follower-count checkpoint per creator/platform, used to derive trends."""
    __tablename__ = "growth"

    id = Column(Integer, primary_key=True, index=True)

    creator_id = Column(Integer, nullable=False, index=True)
    platform = Column(String(50), nullable=False)

    record_date = Column(Date, nullable=False, default=date_type.today)
    follower_count = Column(Integer, nullable=False, default=0)
    new_followers = Column(Integer, nullable=False, default=0)
    unfollows = Column(Integer, nullable=False, default=0)
