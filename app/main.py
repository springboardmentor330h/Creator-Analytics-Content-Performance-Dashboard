# 4 August 2026

from fastapi import FastAPI
from app.db.database import engine, Base
from app.models.user import User
from app.models.content import Content
from app.models.audience import Audience
from app.models.growth import Growth

from app.routers.users import router as user_router
from app.routers.auth import router as auth_router
from app.routers.content import router as content_router
from app.routers.analytics import router as analytics_router
from app.routers.audience import router as audience_router
from app.routers.social import router as social_router

app = FastAPI(title="Creator Analytics Content Performance Dashboard")

# Include Auth Router
app.include_router(user_router)
app.include_router(auth_router)

# Include Content Router
app.include_router(content_router)

# Include Analytics Router
app.include_router(analytics_router)

#Include Audience Router
app.include_router(audience_router)

#Include Social Router
app.include_router(social_router)

@app.get("/")
def root():
    return {"message": "API is running!"}
