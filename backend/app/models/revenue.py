from sqlalchemy import Column, Integer, String, Float, Date, ForeignKey
from app.db.database import Base


class Revenue(Base):
    __tablename__ = "revenues"

    id = Column(Integer, primary_key=True, index=True)

    creator_id = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=False,
        index=True
    )

    source = Column(String(100), nullable=False)

    amount = Column(Float, nullable=False, default=0.0)

    description = Column(String(500), nullable=True)

    revenue_date = Column(Date, nullable=False)
