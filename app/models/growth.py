import uuid

from sqlalchemy import Column, Date, Float, Integer
from sqlalchemy.dialects.postgresql import UUID

from app.db.database import Base


class Growth(Base):
    __tablename__ = "growth"

    id = Column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
        index=True,
    )

    creator_id = Column(
        UUID(as_uuid=True),
        nullable=False,
        index=True,
    )

    date = Column(
        Date,
        nullable=False,
        index=True,
    )

    followers = Column(
        Integer,
        nullable=False,
        default=0,
    )

    reach = Column(
        Integer,
        nullable=False,
        default=0,
    )

    engagement_rate = Column(
        Float,
        nullable=False,
        default=0,
    )
