from datetime import datetime
from sqlalchemy import Column, Date, DateTime, Float, ForeignKey, Integer, String, Text
from sqlalchemy.orm import relationship

from app.db.database import Base

SPONSORSHIP_STATUSES = ("Draft", "Active", "Completed", "Cancelled")
PAYMENT_STATUSES = ("Pending", "Partially Paid", "Paid", "Overdue")


class Sponsorship(Base):
    __tablename__ = "sponsorship"

    id = Column(Integer, primary_key=True, index=True)
    creator_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    brand_name = Column(String(150), nullable=False)
    campaign_name = Column(String(150), nullable=False)
    contract_value = Column(Float, nullable=False, default=0.0)
    currency = Column(String(10), nullable=False, default="INR", server_default="INR")
    start_date = Column(Date, nullable=False)
    end_date = Column(Date, nullable=False)
    status = Column(String(50), nullable=False, default="Draft", server_default="Draft")
    payment_status = Column(String(50), nullable=False, default="Pending", server_default="Pending")
    description = Column(Text, nullable=True)
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)
    updated_at = Column(DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow)

    creator = relationship("User", back_populates="sponsorships")
