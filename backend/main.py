from fastapi import FastAPI

from app.api.user_api import router as user_router
from app.db.database import Base, engine
from app.models.user import User

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI()

app.include_router(user_router)