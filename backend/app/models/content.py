from sqlalchemy import Column, Integer, String, Date
from app.database import Base


class Content(Base):
    __tablename__ = "content"

    id = Column(Integer, primary_key=True, index=True)
    creator_id = Column(Integer, nullable=False, index=True)
    platform = Column(String, nullable=False)
    external_content_id = Column(String, nullable=True, index=True)
    content_title = Column(String, nullable=False)
    views = Column(Integer, nullable=True)      # CHANGED: nullable (was default=0)
    likes = Column(Integer, default=0)
    comments = Column(Integer, default=0)
    shares = Column(Integer, nullable=True)     # CHANGED: nullable
    saves = Column(Integer, default=0)
    watch_time = Column(Integer, default=0)
    reach = Column(Integer, nullable=True)      # CHANGED: nullable
    published_date = Column(Date, nullable=False)