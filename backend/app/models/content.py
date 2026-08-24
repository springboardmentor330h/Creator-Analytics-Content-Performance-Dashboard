from sqlalchemy import Column, Integer, String, Float, Date
from app.database import Base


class Content(Base):
    """
    Represents a single piece of content published by a creator on a
    social media platform, along with its raw analytics metrics.

    external_content_id stores the platform's own ID for this content
    (e.g. a YouTube video ID). Combined with `platform`, it lets us
    detect whether a synced item already exists, so re-syncing updates
    the existing row instead of creating a duplicate.
    """
    __tablename__ = "content"

    id = Column(Integer, primary_key=True, index=True)
    creator_id = Column(Integer, nullable=False, index=True)
    platform = Column(String, nullable=False)
    external_content_id = Column(String, nullable=True, index=True)
    content_title = Column(String, nullable=False)

    views = Column(Integer, nullable=False, default=0)
    likes = Column(Integer, nullable=False, default=0)
    comments = Column(Integer, nullable=False, default=0)
    shares = Column(Integer, nullable=False, default=0)
    saves = Column(Integer, nullable=False, default=0)
    watch_time = Column(Float, nullable=False, default=0)
    reach = Column(Integer, nullable=False, default=0)

    published_date = Column(Date, nullable=False)