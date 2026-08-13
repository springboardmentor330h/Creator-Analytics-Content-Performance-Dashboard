from sqlalchemy import Column, Integer, String, Float, Date
from app.database import Base


class RevenueRecord(Base):
    __tablename__ = "revenue_records"

    id = Column(Integer, primary_key=True, index=True)
    creator_id = Column(Integer, nullable=False, index=True)
    platform = Column(String, nullable=False)
    source = Column(String, nullable=False)  # sponsorship, ad_revenue, affiliate, brand_collab, subscription
    description = Column(String, nullable=True)
    amount = Column(Float, nullable=False)
    currency = Column(String, default="USD")
    earned_date = Column(Date, nullable=False)