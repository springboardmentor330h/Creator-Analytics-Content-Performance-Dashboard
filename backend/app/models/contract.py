from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from app.database import Base

class ManagementContract(Base):
    __tablename__ = "management_contracts"

    id = Column(Integer, primary_key=True, index=True)
    manager_user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False, index=True)
    creator_id = Column(Integer, nullable=False, index=True)
    status = Column(String, default="active")
    created_at = Column(DateTime(timezone=True), server_default=func.now())