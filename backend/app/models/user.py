"""
User table definition.
This is the ORM model — a Python class that SQLAlchemy maps to a real
PostgreSQL table called 'users'.
"""
import enum
import uuid
from datetime import datetime

from sqlalchemy import Column, String, DateTime, Enum

from app.db.session import Base
from app.db.types import GUID


class UserRole(str, enum.Enum):
    creator = "creator"
    admin = "admin"


class User(Base):
    __tablename__ = "users"

    id = Column(GUID(), primary_key=True, default=uuid.uuid4)
    name = Column(String(120), nullable=False)
    email = Column(String(255), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    role = Column(Enum(UserRole), default=UserRole.creator, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
