import uuid

from sqlalchemy import Column, DateTime, Integer, String
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func

from app.db.database import Base


class Creator(Base):
    __tablename__ = "creators"

    id = Column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
    )

    user_id = Column(
        UUID(as_uuid=True),
        nullable=True,
        index=True,
    )

    name = Column(
        String(150),
        nullable=False,
    )

    platform = Column(
        String(50),
        nullable=False,
    )

    followers = Column(
        Integer,
        nullable=False,
        default=0,
    )

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=True,
    )

    updated_at = Column(
        DateTime(timezone=True),
        nullable=True,
    )
