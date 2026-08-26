from sqlalchemy import Column, Integer, String, Float, Date, DateTime
from datetime import datetime

from app.db.database import Base


class Revenue(Base):
    __tablename__ = "revenue"

    id = Column(Integer, primary_key=True, index=True)

    creator_id = Column(Integer, nullable=False, index=True)

    source = Column(String, nullable=False)

    amount = Column(Float, nullable=False)

    currency = Column(String, default="INR", nullable=False)

    description = Column(String, nullable=True)

    revenue_date = Column(Date, nullable=False)

    created_at = Column(
        DateTime,
        default=datetime.utcnow,
        nullable=False
    )