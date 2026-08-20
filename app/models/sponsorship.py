from sqlalchemy import Column, Integer, String, Numeric, Date, DateTime, ForeignKey
from sqlalchemy.sql import func

from app.db.database import Base


class Sponsorship(Base):
    __tablename__ = "sponsorship"

    id = Column(Integer, primary_key=True, index=True)

    creator_id = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=False
    )

    brand_name = Column(String(100), nullable=False)

    campaign = Column(String(200), nullable=False)

    contract_value = Column(Numeric(12, 2), nullable=False)

    start_date = Column(Date, nullable=False)

    end_date = Column(Date, nullable=False)

    status = Column(String(50), nullable=False, default="Active")

    payment_status = Column(
        String(50),
        nullable=False,
        default="Pending"
    )

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now()
    )