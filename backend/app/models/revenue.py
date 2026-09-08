from sqlalchemy import Column, Integer, String, Float, Date, ForeignKey
from app.db.database import Base


class Revenue(Base):
    __tablename__ = "revenue"

    id = Column(Integer, primary_key=True, index=True)

    creator_id = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=False
    )

    source = Column(String, nullable=False)

    amount = Column(Float, nullable=False, default=0)

    currency = Column(String, nullable=False, default="INR")

    revenue_date = Column(Date, nullable=False)

    description = Column(String, nullable=True)