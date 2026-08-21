import enum
from sqlalchemy import Boolean, Column, DateTime, Enum as SQLEnum, Integer, String
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.db.database import Base


class UserRole(str, enum.Enum):
    CREATOR = "Creator"
    AGENCY = "Agency"
    MARKETING_TEAM = "Marketing Team"
    ADMINISTRATOR = "Administrator"


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    full_name = Column(String(100), nullable=False)
    hashed_password = Column(String, nullable=False)
    role = Column(SQLEnum(UserRole), default=UserRole.CREATOR, nullable=False)
    bio = Column(String(500), nullable=True)
    is_active = Column(Boolean, default=True, nullable=False)
    is_deleted = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    revenues = relationship("Revenue", back_populates="user", cascade="all, delete-orphan")
    sponsorships = relationship("Sponsorship", back_populates="user", cascade="all, delete-orphan")
    
    contents = relationship("Content", back_populates="creator")