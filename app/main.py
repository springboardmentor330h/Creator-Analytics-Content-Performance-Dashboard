from fastapi import FastAPI

from app.db.database import engine, Base

# Models
from app.models.user import User
from app.models.content import Content

# Routers
from app.routers.users import router as user_router
from app.routers.auth import router as auth_router
from app.routers.content import router as content_router


# Create database tables
Base.metadata.create_all(bind=engine)


# Create FastAPI application
app = FastAPI(title="CreatorIQ API")


# Include routers
app.include_router(user_router)
app.include_router(auth_router)
app.include_router(content_router)


# Root endpoint
@app.get("/")
def root():
    return {
        "message": "CreatorIQ API is running"
    }