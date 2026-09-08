from sqlalchemy import Column, Integer, String, Float, Date, ForeignKey
from app.db.database import Base


class Sponsorship(Base):
    __tablename__ = "sponsorships"

    id = Column(Integer, primary_key=True, index=True)
    creator_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    brand_name = Column(String, nullable=False)
    campaign_name = Column(String, nullable=False)
    amount = Column(Float, nullable=False)
    status = Column(String, nullable=False, default="Pending")

    start_date = Column(Date, nullable=False)
    end_date = Column(Date, nullable=True)