"""
Database connection setup.

Key SQLAlchemy concepts used here:
- engine: the actual connection to PostgreSQL.
- SessionLocal: a factory that creates new "conversations" (sessions)
  with the database. Each API request gets its own session.
- Base: the parent class every ORM model (table) inherits from.
"""
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

from app.core.config import settings

engine = create_engine(settings.DATABASE_URL)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


def get_db():
    """
    Dependency used by FastAPI routes to get a DB session.
    'yield' means: give the route this session, and once the route
    is done (success or error), the 'finally' block always closes it.
    This prevents leaking open DB connections.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
