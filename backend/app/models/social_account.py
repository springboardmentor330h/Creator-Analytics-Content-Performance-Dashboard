from sqlalchemy import Column, Integer, String, Boolean, DateTime
from datetime import datetime
from backend.app.db.database import Base

class SocialAccount(Base):
    __tablename__ = "social_accounts"

    id = Column(Integer, primary_key=True, index=True)
    creator_id = Column(Integer, nullable=False, index=True)
    platform = Column(String, nullable=False, index=True) # YouTube, Instagram, TikTok, LinkedIn, X
    account_handle = Column(String, nullable=False) # @CreatorIQ, UCxxxx
    account_name = Column(String, nullable=True) # Channel or Account Title
    account_id = Column(String, nullable=True) # Channel ID / External Account ID
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    last_synced_at = Column(DateTime, default=datetime.utcnow)
