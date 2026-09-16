from sqlalchemy import Column, Integer, String

from app.db.database import Base


class Audience(Base):
    """A snapshot of audience demographics for one creator on one platform.

    Rows accumulate over time so we can track how the audience shifts.
    """
    __tablename__ = "audience"

    id = Column(Integer, primary_key=True, index=True)

    creator_id = Column(Integer, nullable=False, index=True)
    platform = Column(String(50), nullable=False)

    age_group = Column(String(20), nullable=True)      # e.g. "18-24"
    gender = Column(String(20), nullable=True)          # e.g. "Male", "Female", "Other"
    country = Column(String(100), nullable=True)
    city = Column(String(100), nullable=True)
    device = Column(String(30), nullable=True)          # e.g. "Mobile", "Desktop", "Tablet"

    active_hour = Column(Integer, nullable=True)         # 0-23, hour of day most active
    follower_count = Column(Integer, nullable=False, default=0)
