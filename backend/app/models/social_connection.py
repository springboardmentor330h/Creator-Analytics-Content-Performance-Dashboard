from sqlalchemy import Column, Integer, String, DateTime
from sqlalchemy.sql import func
from app.database import Base


class SocialConnection(Base):
    __tablename__ = "social_connections"

    id = Column(Integer, primary_key=True, index=True)
    platform = Column(String, nullable=False)
    account_name = Column(String, nullable=False)
    connected_at = Column(DateTime(timezone=True), server_default=func.now())