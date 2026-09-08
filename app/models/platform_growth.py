
from sqlalchemy import Column, Integer, String, Date, ForeignKey

from app.db.database import Base


class PlatformGrowth(Base):
    __tablename__ = "platform_growth"

    id = Column(Integer, primary_key=True, index=True)

    creator_id = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=False
    )

    platform = Column(
        String(50),
        nullable=False
    )

    date = Column(
        Date,
        nullable=False
    )

    followers = Column(
        Integer,
        nullable=False
    )

