from sqlalchemy import Column, Integer, String, Float, Date
from app.db.database import Base

class Content(Base):
    __tablename__ = "content"

    id = Column(Integer, primary_key=True, index=True)
    creator_id = Column(Integer, nullable=False)
    platform = Column(String(50), nullable=False)
    external_content_id = Column(String(255), nullable=True, index=True)  # NEW
    content_title = Column(String(255), nullable=False)
    views = Column(Integer, default=0)
    likes = Column(Integer, default=0)
    comments = Column(Integer, default=0)
    shares = Column(Integer, default=0)
    saves = Column(Integer, default=0)
    watch_time = Column(Float, default=0.0)
    reach = Column(Integer, default=0)
    published_date = Column(Date, nullable=False)