from sqlalchemy import Column, Integer, String, Float, Date
from app.database import Base


class Sponsorship(Base):
    """
    Tracks a brand sponsorship/campaign for a creator: who it's with,
    what it's worth, its timeline, and whether it's been paid.
    """
    __tablename__ = "sponsorship"

    id = Column(Integer, primary_key=True, index=True)
    creator_id = Column(Integer, nullable=False, index=True)
    brand_name = Column(String, nullable=False)
    campaign_name = Column(String, nullable=False)
    contract_value = Column(Float, nullable=False, default=0)
    start_date = Column(Date, nullable=False)
    end_date = Column(Date, nullable=True)
    status = Column(String, nullable=False, default="active")           # active, completed, cancelled
    payment_status = Column(String, nullable=False, default="pending")  # pending, paid, overdue