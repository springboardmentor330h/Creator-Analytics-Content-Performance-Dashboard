from app.db.database import Base, engine

# Import models so SQLAlchemy registers them with Base
from app.models.user import User
from app.models.content import Content


def init_db():
    """
    Create all database tables.

    SQLAlchemy reads the models registered with Base
    and creates the required tables in the database.
    """
    Base.metadata.create_all(bind=engine)