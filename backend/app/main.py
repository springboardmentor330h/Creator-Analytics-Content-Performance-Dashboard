from fastapi import FastAPI

from app.db.database import engine, Base
from app.models.user import User
from app.routers.users import router as user_router

Base.metadata.create_all(bind=engine)

app = FastAPI(title="CreatorIQ API")

app.include_router(user_router)

@app.get("/")
def home():
    return {
        "message": "CreatorIQ API is running"
    }