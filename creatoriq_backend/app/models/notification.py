from datetime import datetime

from sqlalchemy import Boolean, Column, DateTime, Integer, String, Text

from app.db.database import Base


class Notification(Base):
    """
    In-app notifications / alerts for creators.
    Types: performance | engagement | revenue | info
    """

    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True)

    creator_id = Column(Integer, nullable=False, index=True)

    title = Column(String(255), nullable=False)

    message = Column(Text, nullable=False)

    # performance | engagement | revenue | info
    type = Column(String(50), nullable=False, default="info", index=True)

    is_read = Column(Boolean, nullable=False, default=False, index=True)

    # optional deep-link path for the frontend
    link = Column(String(500), nullable=True)

    created_at = Column(
        DateTime,
        nullable=False,
        default=datetime.utcnow,
        index=True,
    )
