from datetime import date
from sqlalchemy import Column, Date, Float, Integer, String
from app.db.database import Base  # Updated path


class Content(Base):
    __tablename__ = "contents"

    id = Column(Integer, primary_key=True, index=True)
    creator_id = Column(Integer, nullable=False, index=True)
    platform = Column(String(50), nullable=False)
    content_title = Column(String(255), nullable=False)
    views = Column(Integer, default=0, nullable=False)
    likes = Column(Integer, default=0, nullable=False)
    comments = Column(Integer, default=0, nullable=False)
    shares = Column(Integer, default=0, nullable=False)
    saves = Column(Integer, default=0, nullable=False)
    watch_time = Column(Float, default=0.0, nullable=False)
    reach = Column(Integer, default=0, nullable=False)
    published_date = Column(Date, nullable=False)