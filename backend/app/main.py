from fastapi import FastAPI

from app.db.database import engine, Base
from app.models.user import User
from app.models.content import Content
from app.routers.users import router as user_router
from app.routers.auth import router as auth_router
from app.routers.content import router as content_router
from app.routers.analytics import router as analytics_router

Base.metadata.create_all(bind=engine)

app = FastAPI(title="CreatorIQ API")

app.include_router(user_router)
app.include_router(auth_router)
app.include_router(content_router)
app.include_router(analytics_router)

@app.get("/")
def home():
    return {"message": "CreatorIQ API is running"}