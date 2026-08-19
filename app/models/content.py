from sqlalchemy import Column, Integer, String, Float, Date, ForeignKey
from sqlalchemy.orm import relationship

from app.db.database import Base


class Content(Base):
    __tablename__ = "contents"

    id = Column(Integer, primary_key=True, index=True)
    creator_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    platform = Column(String, nullable=False, index=True)
    external_content_id = Column(String, nullable=True, index=True)
    content_title = Column(String, nullable=False)
    views = Column(Integer, default=0)
    likes = Column(Integer, default=0)
    comments = Column(Integer, default=0)
    shares = Column(Integer, default=0)
    saves = Column(Integer, default=0)
    watch_time = Column(Float, default=0.0)
    reach = Column(Integer, default=0)
    published_date = Column(Date, nullable=False)

    creator = relationship("User", back_populates="contents")