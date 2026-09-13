import uuid

from sqlalchemy import Column, DateTime, Integer, String
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func

from app.db.database import Base


class Content(Base):
    __tablename__ = "content"

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

    campaign_id = Column(
        UUID(as_uuid=True),
        nullable=True,
        index=True,
    )

    title = Column(
        String(255),
        nullable=False,
    )

    platform = Column(
        String(50),
        nullable=False,
    )

    content_type = Column(
        String(50),
        nullable=False,
    )

    likes = Column(
        Integer,
        nullable=False,
        default=0,
    )

    comments = Column(
        Integer,
        nullable=False,
        default=0,
    )

    shares = Column(
        Integer,
        nullable=False,
        default=0,
    )

    reach = Column(
        Integer,
        nullable=False,
        default=0,
    )

    impressions = Column(
        Integer,
        nullable=False,
        default=0,
    )

    posted_at = Column(
        DateTime(timezone=True),
        nullable=True,
    )

    created_at = Column(
        DateTime(timezone=True),
        nullable=True,
        server_default=func.now(),
    )

    content_title = Column(
        String(255),
        nullable=False,
    )

    views = Column(
        Integer,
        nullable=False,
    )

    saves = Column(
        Integer,
        nullable=False,
    )

    watch_time = Column(
        Integer,
        nullable=False,
    )

    published_date = Column(
        DateTime(timezone=True),
        nullable=True,
    )

    external_content_id = Column(
        String(200),
        nullable=True,
    )