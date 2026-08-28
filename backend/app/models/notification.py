from datetime import datetime

from sqlalchemy import Column, Integer, String, Boolean, DateTime

from app.db.database import Base


class Notification(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True)

    creator_id = Column(Integer, nullable=False, index=True)

    title = Column(String, nullable=False)

    message = Column(String, nullable=False)

    notification_type = Column(String, nullable=False)

    is_read = Column(Boolean, default=False, nullable=False)

    created_at = Column(
        DateTime,
        default=datetime.utcnow,
        nullable=False
    )