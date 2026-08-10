from datetime import datetime

from sqlalchemy import Column, Date, DateTime, Float, ForeignKey, Integer, String
from sqlalchemy.orm import relationship

from app.db.database import Base

CONTENT_TYPES = ('Video', 'Post', 'Reel', 'Short', 'Article', 'Live')
PLATFORMS = ('YouTube', 'Instagram', 'TikTok', 'Facebook', 'X', 'LinkedIn')


class Content(Base):
    __tablename__ = 'content'

    id = Column(Integer, primary_key=True, index=True)
    creator_id = Column(Integer, ForeignKey('users.id', ondelete='CASCADE'), nullable=False, index=True)
    platform = Column(String(50), nullable=False)
    content_id = Column(String(150), nullable=False)
    title = Column(String(255), nullable=False)
    content_type = Column(String(50), nullable=False)
    published_at = Column(Date, nullable=False)
    views = Column(Integer, nullable=False, default=0, server_default='0')
    likes = Column(Integer, nullable=False, default=0, server_default='0')
    comments = Column(Integer, nullable=False, default=0, server_default='0')
    shares = Column(Integer, nullable=False, default=0, server_default='0')
    saves = Column(Integer, nullable=False, default=0, server_default='0')
    watch_time = Column(Integer, nullable=False, default=0, server_default='0')
    reach = Column(Integer, nullable=False, default=0, server_default='0')
    engagement_rate = Column(Float, nullable=False, default=0.0, server_default='0')
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)
    updated_at = Column(DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow)

    creator = relationship('User', back_populates='content')
