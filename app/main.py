from fastapi import FastAPI

from app.db.database import engine, Base


# =========================================================
# Models
# =========================================================

from app.models.user import User
from app.models.content import Content
from app.models.audience import Audience
from app.models.growth import Growth
from app.models.revenue import Revenue
from app.models.sponsorship import Sponsorship


# =========================================================
# Routers
# =========================================================

from app.routers.users import router as user_router
from app.routers.auth import router as auth_router
from app.routers.content import router as content_router
from app.routers.analytics import router as analytics_router
from app.routers.audience import router as audience_router
from app.routers.social import router as social_router
from app.routers.revenue import router as revenue_router


# =========================================================
# Create database tables
# =========================================================

Base.metadata.create_all(bind=engine)


# =========================================================
# Create FastAPI application
# =========================================================

app = FastAPI(
    title="CreatorIQ API"
)


# =========================================================
# Include routers
# =========================================================

app.include_router(user_router)
app.include_router(auth_router)
app.include_router(content_router)
app.include_router(analytics_router)
app.include_router(audience_router)
app.include_router(social_router)
app.include_router(revenue_router)


# =========================================================
# Root endpoint
# =========================================================

@app.get("/")
def root():
    return {
        "message": "CreatorIQ API is running"
    }