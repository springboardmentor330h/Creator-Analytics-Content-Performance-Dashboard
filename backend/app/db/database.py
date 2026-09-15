import os
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

# 📌 Environment variable (PostgreSQL default)
DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql://postgres:nivi1299@localhost:5432/creatoriq"
)

# 📌 SQLite use பண்ணினா மட்டும் இந்த option தேவையா இருக்கும்
connect_args = {}
if DATABASE_URL.startswith("sqlite"):
    connect_args = {"check_same_thread": False}

# 📌 Engine
engine = create_engine(
    DATABASE_URL,
    connect_args=connect_args
)

# 📌 Session
SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)

# 📌 Base
Base = declarative_base()


# 📌 Dependency (FastAPI use)
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()