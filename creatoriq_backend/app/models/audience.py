from sqlalchemy import String
from sqlalchemy.orm import Mapped, mapped_column

from app.db.database import Base


class Audience(Base):
    __tablename__ = "audience"

    id: Mapped[int] = mapped_column(
        primary_key=True,
        index=True,
    )

    creator_id: Mapped[int] = mapped_column(
        nullable=False,
        index=True,
    )

    age_group: Mapped[str] = mapped_column(
        String,
        nullable=False,
    )

    gender: Mapped[str] = mapped_column(
        String,
        nullable=False,
    )

    country: Mapped[str] = mapped_column(
        String,
        nullable=False,
    )

    city: Mapped[str] = mapped_column(
        String,
        nullable=False,
    )

    device_type: Mapped[str] = mapped_column(
        String,
        nullable=False,
    )

    active_hour: Mapped[int] = mapped_column(
        nullable=False,
    )

    followers: Mapped[int] = mapped_column(
        nullable=False,
        default=0,
    )

    impressions: Mapped[int] = mapped_column(
        nullable=False,
        default=0,
    )

    reach: Mapped[int] = mapped_column(
        nullable=False,
        default=0,
    )