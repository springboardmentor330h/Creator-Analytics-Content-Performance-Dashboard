from sqlalchemy import Column, Integer, String, Numeric, DateTime, ForeignKey, Date
from sqlalchemy.sql import func

from app.db.database import Base


class Revenue(Base):
    __tablename__ = "revenue"

    id = Column(Integer, primary_key=True, index=True)

    creator_id = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=False
    )

    source = Column(String(50), nullable=False)

    amount = Column(Numeric(12, 2), nullable=False)

    currency = Column(String(10), default="INR", nullable=False)

    description = Column(String(500), nullable=True)

    revenue_date = Column(Date, nullable=False)

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now()
    )
