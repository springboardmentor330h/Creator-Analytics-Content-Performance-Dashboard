# Database model for revenue data
from sqlalchemy import Column, Date, Integer, String, Float, ForeignKey
from sqlalchemy.orm import relationship

from app.db.database import Base


class Revenue(Base):
    __tablename__ = "revenues"

    id = Column(Integer, primary_key=True, index=True)
    creator_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    amount = Column(Float, nullable=False)
    source = Column(String, nullable=False)  # sponsorship, ad_revenue, affiliate_marketing, etc.
    description = Column(String, nullable=True)
    earned_date = Column(Date, nullable=False)
    
    user = relationship("User", back_populates="revenues")