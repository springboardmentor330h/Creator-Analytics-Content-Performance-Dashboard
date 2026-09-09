import logging
from backend.app.db.database import SessionLocal, engine, Base
from backend.app.db.seed_data import seed_database

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def init_db():
    logger.info("Initializing Database Tables and Seeding Multi-Platform Data...")
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        seed_database(db)
        logger.info("Database Initialization & Multi-Platform Seeding Complete.")
    finally:
        db.close()

if __name__ == "__main__":
    init_db()
