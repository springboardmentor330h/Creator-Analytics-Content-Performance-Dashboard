from sqlalchemy import Column, Date, Float, Integer, String

from app.db.database import Base


class Sponsorship(Base):
    __tablename__ = "sponsorships"

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
        nullable=False
    )

    campaign = Column(
        String(255),
        nullable=False
    )

    contract_value = Column(
        Float,
        nullable=False,
        default=0
    )

    start_date = Column(
        Date,
        nullable=False
    )

    end_date = Column(
        Date,
        nullable=False
    )

    status = Column(
        String(50),
        nullable=False,
        default="Active"
    )

    payment_status = Column(
        String(50),
        nullable=False,
        default="Pending"
    )