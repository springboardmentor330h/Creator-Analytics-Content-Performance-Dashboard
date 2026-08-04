import os
from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base


load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

engine = create_engine(DATABASE_URL)

SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)

Base = declarative_base()

# Create all tables
Base.metadata.create_all(bind=engine)

# Connection test
try:
    connection = engine.connect()
    print("PostgreSQL connected successfully")
    connection.close()
except Exception as e:
    print(e)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()