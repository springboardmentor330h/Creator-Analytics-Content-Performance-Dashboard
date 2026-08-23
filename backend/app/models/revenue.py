from sqlalchemy import Column, Integer, String, Float, Date
from app.db.database import Base

class Revenue(Base):
    __tablename__ = "revenue"

    id = Column(Integer, primary_key=True, index=True)
    creator_id = Column(Integer, nullable=False)
    source = Column(String(50), nullable=False)  # Sponsorship, Ad Revenue, Affiliate Marketing, Brand Collaboration, Subscription
    amount = Column(Float, nullable=False)
    description = Column(String(255), nullable=True)
    date = Column(Date, nullable=False)