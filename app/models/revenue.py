from sqlalchemy import Column, Date, Float, Integer, String

from app.db.database import Base


class Revenue(Base):
    __tablename__ = "revenue"

    id = Column(Integer, primary_key=True, index=True)

    creator_id = Column(
        Integer,
        nullable=False,
        index=True
    )

    source = Column(
        String(100),
        nullable=False
    )

    amount = Column(
        Float,
        nullable=False,
        default=0
    )

    description = Column(
        String(255),
        nullable=True
    )

    date = Column(
        Date,
        nullable=False
    )