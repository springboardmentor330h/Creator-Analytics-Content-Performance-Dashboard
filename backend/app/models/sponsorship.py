from sqlalchemy import Column, Integer, String, Float, Date
from app.db.database import Base

class Sponsorship(Base):
    __tablename__ = "sponsorship"

    id = Column(Integer, primary_key=True, index=True)
    creator_id = Column(Integer, nullable=False)
    brand_name = Column(String(255), nullable=False)
    campaign_name = Column(String(255), nullable=False)
    contract_value = Column(Float, nullable=False)
    start_date = Column(Date, nullable=False)
    end_date = Column(Date, nullable=True)
    status = Column(String(50), default="active")           # active, completed, cancelled
    payment_status = Column(String(50), default="pending")  # pending, paid, overdue