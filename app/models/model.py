from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from app.db.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    role = Column(String, default="creator")  # "admin" or "creator"
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    contents = relationship("Content", back_populates="creator")

class Content(Base):
    __tablename__ = "content"

    id = Column(Integer, primary_key=True, index=True)
    creator_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    platform = Column(String, nullable=False, default="YouTube")  # 'YouTube', 'LinkedIn', 'Instagram'
    platform_content_id = Column(String, nullable=False, index=True)
    title = Column(String, nullable=False)
    views = Column(Integer, default=0)
    likes = Column(Integer, default=0)
    comments = Column(Integer, default=0)
    shares = Column(Integer, nullable=True)
    reach = Column(Integer, nullable=True)
    published_at = Column(DateTime, default=datetime.utcnow)

    creator = relationship("User", back_populates="contents")