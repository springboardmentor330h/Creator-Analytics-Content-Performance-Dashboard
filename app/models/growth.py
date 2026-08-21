from sqlalchemy import Column, Integer, String, Float, Date, ForeignKey
from sqlalchemy.orm import relationship

from app.db.database import Base


class ContentGrowth(Base):
    __tablename__ = "content_growth"

    id = Column(Integer, primary_key=True, index=True)
    creator_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    date = Column(Date, nullable=False)
    followers = Column(Integer, default=0)
    engagement_rate = Column(Float, default=0.0)

    creator = relationship("User")
    
Growth = ContentGrowth