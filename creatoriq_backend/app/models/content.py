from datetime import date

from sqlalchemy import Column, Date, Integer, String, UniqueConstraint
from app.db.database import Base


class Content(Base):
    __tablename__ = "content"

    __table_args__ = (UniqueConstraint('creator_id', 'external_content_id', name='uq_creator_external_content'),)

    id = Column(Integer, primary_key=True, index=True)

    creator_id = Column(Integer, nullable=False, index=True)

    platform = Column(String(50), nullable=False, index=True)

    # Used for external platforms such as YouTube
    external_content_id = Column(String(255), nullable=True, index=True)

    content_title = Column(String(255), nullable=False)

    views = Column(Integer, nullable=False, default=0)
    likes = Column(Integer, nullable=False, default=0)
    comments = Column(Integer, nullable=False, default=0)
    shares = Column(Integer, nullable=False, default=0)
    saves = Column(Integer, nullable=False, default=0)

    watch_time = Column(Integer, nullable=False, default=0)
    reach = Column(Integer, nullable=False, default=0)

    published_date = Column(Date, nullable=False)