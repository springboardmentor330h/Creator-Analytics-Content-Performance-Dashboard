from sqlalchemy import Column, Integer, String, Date
from app.db.database import Base


class Content(Base):
    __tablename__ = "content"

    id = Column(Integer, primary_key=True, index=True)
    creator_id = Column(Integer, nullable=False)
    platform = Column(String, nullable=False)
    external_content_id = Column(String, nullable=True)
    content_title = Column(String, nullable=False)

    views = Column(Integer, default=0, nullable=False)
    likes = Column(Integer, default=0, nullable=False)
    comments = Column(Integer, default=0, nullable=False)
    shares = Column(Integer, default=0, nullable=False)
    saves = Column(Integer, default=0, nullable=False)
    watch_time = Column(Integer, default=0, nullable=False)
    reach = Column(Integer, default=0, nullable=False)

    published_date = Column(Date, nullable=False)