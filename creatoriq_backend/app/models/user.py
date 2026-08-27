from datetime import datetime

from sqlalchemy import Column, DateTime, ForeignKey, Integer, String, Text
from sqlalchemy.orm import relationship

from app.db.database import Base

USER_ROLES = ('Creator', 'Agency', 'Marketing Team', 'Administrator')
USER_STATUSES = ('active', 'inactive')


class User(Base):
    __tablename__ = 'users'

    id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String(100), nullable=False)
    email = Column(String(255), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    role = Column(String(50), nullable=False, default='Creator')
    status = Column(String(20), nullable=False, default='active', server_default='active')
    agency_id = Column(Integer, ForeignKey('users.id', ondelete='SET NULL'), nullable=True, index=True)
    bio = Column(Text, nullable=True)
    avatar_url = Column(String(500), nullable=True)
    youtube_url = Column(String(500), nullable=True)
    instagram_url = Column(String(500), nullable=True)
    tiktok_url = Column(String(500), nullable=True)
    facebook_url = Column(String(500), nullable=True)
    twitter_url = Column(String(500), nullable=True)
    linkedin_url = Column(String(500), nullable=True)
    website_url = Column(String(500), nullable=True)
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)
    updated_at = Column(DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow)

    content = relationship('Content', back_populates='creator', cascade='all, delete-orphan')
    social_connections = relationship('SocialConnection', back_populates='user', cascade='all, delete-orphan')
    revenues = relationship('Revenue', back_populates='creator', cascade='all, delete-orphan')
    sponsorships = relationship('Sponsorship', back_populates='creator', cascade='all, delete-orphan')
    notifications = relationship('Notification', back_populates='creator', cascade='all, delete-orphan')
    agency = relationship(
        'User',
        remote_side=[id],
        back_populates='assigned_creators',
        foreign_keys=[agency_id],
    )
    assigned_creators = relationship(
        'User',
        back_populates='agency',
        foreign_keys=[agency_id],
    )
