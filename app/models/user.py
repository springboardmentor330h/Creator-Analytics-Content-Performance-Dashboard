# from enum import Enum
# import enum
# from sqlalchemy import Boolean, Column, DateTime, Enum as SQLEnum, Integer, String
# from sqlalchemy.sql import func

# from app.db.database import Base


# class UserRole(str, enum.Enum):
#     CREATOR = "Creator"
#     AGENCY = "Agency"
#     MARKETING_TEAM = "Marketing Team"
#     ADMINISTRATOR = "Administrator"


# class User(Base):
#     __tablename__ = "users"

#     id = Column(Integer, primary_key=True, index=True)
#     full_name = Column(String(100), nullable=False)
#     email = Column(String(150), unique=True, index=True, nullable=False)
#     hashed_password = Column(String(255), nullable=False)
#     role = Column(SQLEnum(UserRole), default=UserRole.CREATOR, nullable=False)
#     bio = Column(String(500), nullable=True)
#     is_active = Column(Boolean, default=True, nullable=False)
#     is_deleted = Column(Boolean, default=False, nullable=False)
#     created_at = Column(DateTime(timezone=True), server_default=func.now())
#     updated_at = Column(DateTime(timezone=True), onupdate=func.now())


from sqlalchemy import Column, Integer, String
from app.db.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String(100), nullable=False)
    email = Column(String(255), unique=True, nullable=False)
    password = Column(String(255), nullable=False)
    role = Column(String(50), nullable=False)
