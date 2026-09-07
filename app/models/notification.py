from sqlalchemy import Boolean, Column, DateTime, Integer, String, Text
from sqlalchemy.sql import func

from app.db.database import Base


class Notification(Base):
    """A persisted alert for a creator (performance spike/drop, revenue alert, etc.)."""
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True)

    creator_id = Column(Integer, nullable=False, index=True)
    notification_type = Column(String(50), nullable=False)  # "performance", "revenue", "system"
    title = Column(String(150), nullable=False)
    message = Column(Text, nullable=False)

    is_read = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
