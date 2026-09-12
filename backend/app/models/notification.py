"""
Notification model.

WHY one table with a `notification_type` enum, instead of separate
tables for performance/engagement/revenue alerts?
All three are the same shape (title, message, read/unread, timestamp,
tied to a creator) — they differ only in *what triggered them* and
*what icon/category the frontend shows*. A shared table with a type
column avoids three near-identical tables and three near-identical
CRUD paths, while `notification_type` still lets the API filter by
category when needed.
"""
import enum
import uuid
from datetime import datetime

from sqlalchemy import Column, String, DateTime, Enum, Boolean, ForeignKey, Text
from sqlalchemy.orm import relationship

from app.db.session import Base
from app.db.types import GUID


class NotificationType(str, enum.Enum):
    performance = "performance"   # e.g. a video crossed a view milestone
    engagement = "engagement"     # e.g. engagement rate dropped/spiked
    revenue = "revenue"           # e.g. a payout was received, or is pending


class Notification(Base):
    __tablename__ = "notifications"

    id = Column(GUID(), primary_key=True, default=uuid.uuid4)
    creator_id = Column(GUID(), ForeignKey("users.id"), nullable=False, index=True)

    notification_type = Column(Enum(NotificationType), nullable=False)
    title = Column(String(200), nullable=False)
    message = Column(Text, nullable=False)
    is_read = Column(Boolean, default=False, nullable=False)

    created_at = Column(DateTime, default=datetime.utcnow, nullable=False, index=True)

    creator = relationship("User", backref="notifications")
