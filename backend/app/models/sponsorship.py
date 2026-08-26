from sqlalchemy import Column, Integer, String, Float, Date, DateTime
from datetime import datetime

from app.db.database import Base


class Sponsorship(Base):
    __tablename__ = "sponsorships"

    id = Column(Integer, primary_key=True, index=True)

    creator_id = Column(Integer, nullable=False, index=True)

    brand_name = Column(String, nullable=False)

    campaign = Column(String, nullable=False)

    contract_value = Column(Float, nullable=False)

    start_date = Column(Date, nullable=False)

    end_date = Column(Date, nullable=False)

    status = Column(String, nullable=False, default="Active")

    payment_status = Column(
        String,
        nullable=False,
        default="Pending"
    )

    created_at = Column(
        DateTime,
        default=datetime.utcnow,
        nullable=False
    )