from datetime import date

from sqlalchemy import Date, Float
from sqlalchemy.orm import Mapped, mapped_column

from app.db.database import Base


class Growth(Base):
    __tablename__ = "growth"

    id: Mapped[int] = mapped_column(
        primary_key=True,
        index=True,
    )

    creator_id: Mapped[int] = mapped_column(
        nullable=False,
        index=True,
    )

    date: Mapped[date] = mapped_column(
        Date,
        nullable=False,
        index=True,
    )

    followers: Mapped[int] = mapped_column(
        nullable=False,
        default=0,
    )

    reach: Mapped[int] = mapped_column(
        nullable=False,
        default=0,
    )

    engagement_rate: Mapped[float] = mapped_column(
        Float,
        nullable=False,
        default=0.0,
    )