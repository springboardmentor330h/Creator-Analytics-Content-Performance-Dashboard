from datetime import date
from sqlalchemy import Column, Date, Float, Integer, String
from app.db.database import Base

class Revenue(Base):
    __tablename__ = "revenue"
    id = Column(Integer, primary_key=True, index=True)
    creator_id = Column(Integer, nullable=False, index=True)
    source = Column(String(80), nullable=False, index=True)
    amount = Column(Float, nullable=False, default=0)
    currency = Column(String(10), nullable=False, default="INR")
    received_date = Column(Date, nullable=False)
    description = Column(String(500), nullable=True)
