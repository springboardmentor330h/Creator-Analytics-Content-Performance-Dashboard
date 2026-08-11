from sqlalchemy import Column, Integer, String, Date

from app.db.database import Base


class Content(Base):
    __tablename__ = "content"

    id = Column(Integer, primary_key=True, index=True)

    creator_id = Column(Integer, nullable=False, index=True)

    platform = Column(String, nullable=False)

    content_title = Column(String, nullable=False)

    views = Column(Integer, nullable=False, default=0)
    likes = Column(Integer, nullable=False, default=0)
    comments = Column(Integer, nullable=False, default=0)
    shares = Column(Integer, nullable=False, default=0)
    saves = Column(Integer, nullable=False, default=0)

    watch_time = Column(Integer, nullable=False, default=0)

    reach = Column(Integer, nullable=False, default=0)

    published_date = Column(Date, nullable=False)