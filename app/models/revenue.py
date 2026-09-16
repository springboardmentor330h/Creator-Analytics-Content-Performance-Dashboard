from datetime import date as date_type

from sqlalchemy import Column, Date, Float, Integer, String

from app.db.database import Base


class RevenueRecord(Base):
    """A single earning event for a creator (ad revenue, brand deal, tips, etc.)."""
    __tablename__ = "revenue_records"

    id = Column(Integer, primary_key=True, index=True)

    creator_id = Column(Integer, nullable=False, index=True)
    platform = Column(String(50), nullable=False)
    source = Column(String(50), nullable=False)  # "Ad Revenue", "Sponsorship", "Tips", "Affiliate"

    amount = Column(Float, nullable=False, default=0.0)
    currency = Column(String(10), nullable=False, default="USD")
    record_date = Column(Date, nullable=False, default=date_type.today)


class Sponsorship(Base):
    """A brand sponsorship / paid partnership deal."""
    __tablename__ = "sponsorships"

    id = Column(Integer, primary_key=True, index=True)

    creator_id = Column(Integer, nullable=False, index=True)
    brand_name = Column(String(150), nullable=False)
    platform = Column(String(50), nullable=False)

    deal_amount = Column(Float, nullable=False, default=0.0)
    status = Column(String(20), nullable=False, default="Pending")  # Pending, Active, Completed, Cancelled

    start_date = Column(Date, nullable=True)
    end_date = Column(Date, nullable=True)
