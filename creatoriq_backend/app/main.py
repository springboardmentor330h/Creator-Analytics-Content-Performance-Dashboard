from fastapi import FastAPI

from app.db.database import engine, Base

from app.models.user import User
from app.models.content import Content
from app.models.audience import Audience
from app.models.growth import Growth

from app.routers.users import router as user_router
from app.routers.auth import router as auth_router
from app.routers.youtube import router as youtube_router
from app.routers.content_analytics import router as content_analytics_router
from app.routers.content import router as content_router
from app.routers.analytics import router as analytics_router
from app.routers.audience import router as audience_router
from app.routers.social import router as social_router
from app.models.revenue import Revenue
from app.models.sponsorship import Sponsorship
from app.routers.revenue import router as revenue_router
from app.routers.sponsorship import router as sponsorship_router
from app.routers.revenue_analytics import (
    router as revenue_analytics_router,
)
from app.models.notification import Notification
from app.routers.notification import router as notification_router
from app.routers.reporting import router as reporting_router

from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="CreatorIQ API")

origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

Base.metadata.create_all(bind=engine)


app.include_router(user_router)
app.include_router(auth_router)

# Existing YouTube APIs
app.include_router(youtube_router)
app.include_router(content_analytics_router)

# Content Analytics
app.include_router(content_router)
app.include_router(analytics_router)

# Audience Analytics
app.include_router(audience_router)

# Social Media Workflow
app.include_router(social_router)

# Revenue and Sponsorship APIs
app.include_router(revenue_router)
app.include_router(sponsorship_router)
app.include_router(revenue_analytics_router)

# Notifications and Reporting
app.include_router(notification_router)
app.include_router(reporting_router)


@app.get("/")
def home():
    return {
        "message": "CreatorIQ API is running"
    }