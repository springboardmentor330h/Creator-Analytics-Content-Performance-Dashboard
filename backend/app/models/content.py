from sqlalchemy import Column, Integer, String, Date
from backend.app.db.database import Base

class Content(Base):
    __tablename__ = "contents"

    id = Column(Integer, primary_key=True, index=True)
    creator_id = Column(Integer, nullable=False)
    platform = Column(String, nullable=False)
    content_title = Column(String, nullable=False)
    views = Column(Integer, default=0)
    likes = Column(Integer, default=0)
    comments = Column(Integer, default=0)
    shares = Column(Integer, default=0)
    saves = Column(Integer, default=0)
    watch_time = Column(Integer, default=0)
    reach = Column(Integer, default=0)
    published_date = Column(Date, nullable=True)
