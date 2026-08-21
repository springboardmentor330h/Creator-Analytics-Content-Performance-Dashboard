# Database model for sponsorship
from sqlalchemy import Column, Date, Integer, String, Float, ForeignKey
from sqlalchemy.orm import relationship
from app.db.database import Base

class Sponsorship(Base):
    __tablename__ = "sponsorships"

    id = Column(Integer, primary_key=True, index=True)
    creator_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    sponsor_name = Column(String, nullable=False)
    amount = Column(Float, nullable=False)
    description = Column(String, nullable=True)
    start_date = Column(Date, nullable=False)
    end_date = Column(Date, nullable=True)
    payment_status = Column(String, nullable=False)  # pending, completed, failed, etc.

    user = relationship("User", back_populates="sponsorships")