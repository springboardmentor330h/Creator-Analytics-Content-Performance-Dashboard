from fastapi import FastAPI

from app.api.user_api import router as user_router
from app.routers.content import router as content_router
from app.routers.analytics import router as analytics_router
from app.routers.audience import router as audience_router
from app.routers.social import router as social_router
from app.db.database import Base, engine
from app.models.user import User
from app.models.content import Content


# Create database tables
Base.metadata.create_all(bind=engine)


app = FastAPI()


# Include routers
app.include_router(user_router)
app.include_router(content_router)
app.include_router(analytics_router)
app.include_router(audience_router)
app.include_router(social_router)