from sqlalchemy import Column, Date, Float, ForeignKey, Integer

from app.db.database import Base


class Growth(Base):
    __tablename__ = "growth"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    creator_id = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=False,
        index=True
    )

    date = Column(
        Date,
        nullable=False,
        index=True
    )

    followers = Column(
        Integer,
        nullable=False,
        default=0
    )

    reach = Column(
        Integer,
        nullable=False,
        default=0
    )

    engagement_rate = Column(
        Float,
        nullable=False,
        default=0.0
    )