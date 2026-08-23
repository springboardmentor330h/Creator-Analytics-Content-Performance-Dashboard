from datetime import date
from sqlalchemy import Date, String
from sqlalchemy.orm import Mapped, mapped_column
from app.db.database import Base

class Content(Base):
    __tablename__ = "content"

    id: Mapped[int] = mapped_column(
        primary_key=True,
        index=True,
    )

    creator_id: Mapped[int] = mapped_column(
        nullable=False,
        index=True,
    )

    platform: Mapped[str] = mapped_column(
        String,
        nullable=False,
    )

    external_content_id: Mapped[str | None] = mapped_column(
        String,
        nullable=True,
        index=True,
    )

    content_title: Mapped[str] = mapped_column(
        String,
        nullable=False,
    )

    views: Mapped[int] = mapped_column(
        nullable=False,
        default=0,
    )

    likes: Mapped[int] = mapped_column(
        nullable=False,
        default=0,
    )

    comments: Mapped[int] = mapped_column(
        nullable=False,
        default=0,
    )

    shares: Mapped[int] = mapped_column(
        nullable=False,
        default=0,
    )

    saves: Mapped[int] = mapped_column(
        nullable=False,
        default=0,
    )

    watch_time: Mapped[int] = mapped_column(
        nullable=False,
        default=0,
    )

    reach: Mapped[int] = mapped_column(
        nullable=False,
        default=0,
    )

    published_date: Mapped[date] = mapped_column(
        Date,
        nullable=False,
    )