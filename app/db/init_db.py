from app.db.database import Base, engine


def init_db():
    """
    Create all database tables.

    SQLAlchemy reads the models registered with Base
    and creates the required tables in the database.
    """

    Base.metadata.create_all(bind=engine)