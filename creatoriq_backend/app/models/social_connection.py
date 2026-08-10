from datetime import datetime
from sqlalchemy import Column, DateTime, ForeignKey, Integer, String, Text, UniqueConstraint
from sqlalchemy.orm import relationship

from app.db.database import Base

ALLOWED_PLATFORMS = ('youtube', 'instagram', 'tiktok', 'facebook', 'twitter', 'linkedin')
ALLOWED_STATUSES = (
    'connected',
    'disconnected',
    'expired',
    'error',
    'pending',
    'not_configured',
)


class SocialConnection(Base):
    __tablename__ = 'social_connections'
    __table_args__ = (
        UniqueConstraint('user_id', 'platform', name='uix_user_platform'),
    )

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey('users.id', ondelete='CASCADE'), nullable=False, index=True)
    platform = Column(String(50), nullable=False, index=True)
    platform_user_id = Column(String(255), nullable=True)
    platform_username = Column(String(255), nullable=True)
    display_name = Column(String(255), nullable=True)
    profile_url = Column(String(500), nullable=True)
    access_token_encrypted = Column(Text, nullable=True)
    refresh_token_encrypted = Column(Text, nullable=True)
    token_expires_at = Column(DateTime, nullable=True)
    scopes = Column(Text, nullable=True)
    status = Column(String(50), nullable=False, default='not_configured', server_default='not_configured')
    last_synced_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)
    updated_at = Column(DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = relationship('User', back_populates='social_connections')
