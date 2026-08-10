import uuid
from sqlalchemy import Column, String, Integer, Float, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from app.database import Base

class ContentItem(Base):
    __tablename__ = "content_items"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    owner_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    platform = Column(String, default="youtube")
    video_id = Column(String, unique=True, nullable=False)
    title = Column(String, nullable=False)
    channel_title = Column(String, nullable=True)
    thumbnail_url = Column(String, nullable=True)
    published_at = Column(DateTime(timezone=True), nullable=True)

    views = Column(Integer, default=0)
    likes = Column(Integer, default=0)
    comments = Column(Integer, default=0)
    shares = Column(Integer, default=0)          
    saves = Column(Integer, default=0)            
    watch_time_minutes = Column(Float, default=0) 

    fetched_at = Column(DateTime(timezone=True), server_default=func.now())
    