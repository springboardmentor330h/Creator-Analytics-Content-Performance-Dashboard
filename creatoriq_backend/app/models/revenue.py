from datetime import datetime
from sqlalchemy import Column, Date, DateTime, Float, ForeignKey, Integer, String, Text
from sqlalchemy.orm import relationship

from app.db.database import Base

REVENUE_SOURCES = (
    "Sponsorship",
    "Ad Revenue",
    "Affiliate Marketing",
    "Brand Collaboration",
    "Subscription Revenue",
)


class Revenue(Base):
    __tablename__ = "revenue"

    id = Column(Integer, primary_key=True, index=True)
    creator_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    source = Column(String(100), nullable=False)
    amount = Column(Float, nullable=False, default=0.0)
    currency = Column(String(10), nullable=False, default="INR", server_default="INR")
    description = Column(Text, nullable=True)
    revenue_date = Column(Date, nullable=False)
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)
    updated_at = Column(DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow)

    creator = relationship("User", back_populates="revenues")
