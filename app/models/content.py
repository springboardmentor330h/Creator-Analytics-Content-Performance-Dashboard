from sqlalchemy import BigInteger, Column, DateTime, Integer, String, Float, Date, ForeignKey, UniqueConstraint, func
from sqlalchemy.orm import relationship

from app.db.database import Base


class Content(Base):
    __tablename__ = "contents"

    id = Column(Integer, primary_key=True, index=True)
    creator_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    platform = Column(String, nullable=False, index=True)
    external_content_id = Column(String, nullable=True, index=True)
    content_title = Column(String, nullable=False)
    views = Column(Integer, default=0)
    likes = Column(Integer, default=0)
    comments = Column(Integer, default=0)
    shares = Column(Integer, default=0)
    saves = Column(Integer, default=0)
    watch_time = Column(Float, default=0.0)
    reach = Column(Integer, default=0)
    published_date = Column(Date, nullable=False)

    creator = relationship("User", back_populates="contents")


class ContentItem(Base):
    """Platform-neutral analytics record used by the multi-platform dashboard.

    ``Content`` is retained for the original creator-scoped CRUD APIs.  New
    ingestion pipelines should write to this model so every platform has the
    same metric shape.
    """

    __tablename__ = "content_items"
    __table_args__ = (
        UniqueConstraint("platform", "content_id", name="uq_content_items_platform_content_id"),
    )

    id = Column(Integer, primary_key=True, index=True)
    platform = Column(String(32), nullable=False, index=True)
    content_id = Column(String(255), nullable=False)
    title = Column(String(500), nullable=False)
    url = Column(String(2048), nullable=True)
    views = Column(BigInteger, nullable=False, default=0, server_default="0")
    likes = Column(Integer, nullable=False, default=0, server_default="0")
    comments = Column(Integer, nullable=False, default=0, server_default="0")
    shares = Column(Integer, nullable=False, default=0, server_default="0")
    reach = Column(BigInteger, nullable=False, default=0, server_default="0")
    published_at = Column(DateTime(timezone=True), nullable=False, index=True)
    created_at = Column(DateTime(timezone=True), nullable=False, server_default=func.now())
