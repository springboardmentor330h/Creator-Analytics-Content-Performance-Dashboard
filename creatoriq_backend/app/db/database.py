import os
from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

# Check that it exists
if DATABASE_URL is None:
    raise ValueError("DATABASE_URL is not set in the .env file")

engine = create_engine(DATABASE_URL)

# Temporary connection test
try:
    connection = engine.connect()
    print("PostgreSQL connected successfully")
    connection.close()
except Exception as e:
    print(e)

SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()