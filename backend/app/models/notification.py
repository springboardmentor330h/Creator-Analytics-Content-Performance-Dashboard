from datetime import datetime
from sqlalchemy import Column, Integer, String, Boolean, DateTime
from app.database import Base


class Notification(Base):
    """
    A single alert/notification for a creator — performance, engagement,
    or revenue related. Tracks read/unread status.
    """
    __tablename__ = "notification"

    id = Column(Integer, primary_key=True, index=True)
    creator_id = Column(Integer, nullable=False, index=True)
    type = Column(String, nullable=False)   # "performance", "engagement", "revenue"
    title = Column(String, nullable=False)
    message = Column(String, nullable=False)
    is_read = Column(Boolean, nullable=False, default=False)
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)