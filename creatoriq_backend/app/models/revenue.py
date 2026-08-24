from sqlalchemy import Column, Date, Float, Integer, String

from app.db.database import Base


class Revenue(Base):
    __tablename__ = "revenue"

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

    # sponsorship | ad_revenue | affiliate_marketing |
    # brand_collaboration | subscription_revenue
    source = Column(
        String(50),
        nullable=False,
        index=True
    )

    amount = Column(
        Float,
        nullable=False,
        default=0.0
    )

    currency = Column(
        String(10),
        nullable=False,
        default="USD"
    )

    description = Column(
        String(255),
        nullable=True
    )

    date = Column(
        Date,
        nullable=False,
        index=True
    )