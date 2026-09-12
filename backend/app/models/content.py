"""
Content table — one row per piece of content a creator has posted
(a YouTube video, an Instagram reel, a TikTok, etc).

WHY store raw counts (likes, comments...) instead of pre-computed
engagement rate? Raw counts are the source of truth. Engagement rate
is a DERIVED value — if we stored it directly, it could go stale or
disagree with the raw numbers. We compute it on read instead (see
services/content_service.py).
"""
import enum
import uuid
from datetime import datetime

from sqlalchemy import Column, String, DateTime, Enum, Integer, ForeignKey
from sqlalchemy.orm import relationship

from app.db.session import Base
from app.db.types import GUID


class Platform(str, enum.Enum):
    youtube = "youtube"
    instagram = "instagram"
    tiktok = "tiktok"


class ContentType(str, enum.Enum):
    video = "video"
    short = "short"
    post = "post"
    reel = "reel"
    story = "story"


class Content(Base):
    __tablename__ = "content"

    id = Column(GUID(), primary_key=True, default=uuid.uuid4)
    creator_id = Column(GUID(), ForeignKey("users.id"), nullable=False, index=True)

    # The source platform's own ID for this content (e.g. YouTube video ID).
    # NULL for manually-entered content (Sprint 2 flow); set when content
    # arrives via an API sync (Sprint 5+). This is what makes re-syncing
    # idempotent — see services/sync_service.py.
    external_id = Column(String(255), nullable=True, index=True)

    platform = Column(Enum(Platform), nullable=False)
    content_type = Column(Enum(ContentType), nullable=False)
    title = Column(String(255), nullable=False)
    publish_date = Column(DateTime, nullable=False)

    reach = Column(Integer, default=0, nullable=False)
    impressions = Column(Integer, default=0, nullable=False)
    likes = Column(Integer, default=0, nullable=False)
    comments = Column(Integer, default=0, nullable=False)
    shares = Column(Integer, default=0, nullable=False)
    saves = Column(Integer, default=0, nullable=False)
    views = Column(Integer, default=0, nullable=False)

    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    creator = relationship("User", backref="content_items")
