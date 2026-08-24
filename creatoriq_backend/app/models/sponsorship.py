from sqlalchemy import Column, Date, Float, Integer, String

from app.db.database import Base


class Sponsorship(Base):
    __tablename__ = "sponsorship"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    creator_id = Column(
        Integer,
        nullable=False,
        index=True
    )

    brand_name = Column(
        String(150),
        nullable=False,
        index=True
    )

    campaign_name = Column(
        String(150),
        nullable=False
    )

    contract_value = Column(
        Float,
        nullable=False,
        default=0.0
    )

    start_date = Column(
        Date,
        nullable=False
    )

    end_date = Column(
        Date,
        nullable=True
    )

    # pending | active | completed | cancelled
    status = Column(
        String(30),
        nullable=False,
        default="pending"
    )

    # unpaid | partial | paid
    payment_status = Column(
        String(30),
        nullable=False,
        default="unpaid"
    )