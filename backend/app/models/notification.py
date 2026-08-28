from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey
from sqlalchemy.sql import func
from backend.app.db.database import Base


class Notification(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True)
    creator_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    title = Column(String, nullable=False)
    message = Column(String, nullable=False)
    type = Column(String, nullable=False, default="system", index=True)  # performance, engagement, revenue, system
    severity = Column(String, nullable=False, default="info")  # info, success, warning, alert
    is_read = Column(Boolean, nullable=False, default=False, index=True)
    action_url = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
