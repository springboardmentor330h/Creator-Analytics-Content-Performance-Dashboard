from dotenv import load_dotenv

load_dotenv()

import random
from fastapi import Depends, FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.core.config import settings
from app.db.database import Base, engine, get_db
from app.models.content import Content
from app.models.user import User
from app.services.analytics_service import AnalyticsService
from app.services.social_media import SocialMediaService

# Import the models module to ensure all ORM relationships register with Base.metadata
import app.models

# Import Routers
from app.routers import (
    analytics,
    audience as audience_router,
    auth,
    content as content_router,
    content_items,
    notification,
    report,
    reports,
    revenue,
    social,
    sponsorship,
    user,  # Added users router
)

app = FastAPI(
    title="CreatorIQ: Creator Analytics & Content Performance Dashboard",
    description="Backend API for tracking multi-platform creator metrics, audience analytics, and performance growth.",
    version="5.0.0",
)

# Configure CORS Middleware
# Allow Vite dev servers and common local frontends during development.
development_origins = [
    "http://localhost:5173",
    "http://localhost:5174",
    "http://localhost:4173",
    "http://127.0.0.1:5173",
    "http://127.0.0.1:5174",
    "http://127.0.0.1:4173",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]
origins = list({*development_origins, *(origin.strip() for origin in settings.CORS_ORIGINS.split(",") if origin.strip())})

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_origin_regex=r"https?://(localhost|127\.0\.0\.1)(:\d+)?$",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["Content-Disposition"],  # Required for PDF & Excel browser downloads
)

# Create all database tables in PostgreSQL if they don't exist
Base.metadata.create_all(bind=engine)

# Register Application Routers
app.include_router(user.router)  # Registered users router
app.include_router(content_router.router)
app.include_router(content_items.router)
app.include_router(analytics.router)
app.include_router(audience_router.router)
app.include_router(social.router)
app.include_router(sponsorship.router)  # Registered sponsorship router
app.include_router(revenue.router)  # Registered revenue router
app.include_router(notification.router)  # Registered notification router
app.include_router(reports.router)
app.include_router(report.router)  # Registered legacy report router
app.include_router(auth.router)  # Registered authentication router


def ensure_demo_creator_and_content(db: Session, creator_id: int = 1) -> None:
    user = db.query(User).filter(User.id == creator_id).first()
    if not user:
        user = User(
            id=creator_id,
            email=f"demo{creator_id}@creatoriq.com",
            full_name="Demo Creator",
            hashed_password="placeholder",
            role="creator",
            is_active=True,
        )
        db.add(user)
        db.commit()
        db.refresh(user)

    if db.query(Content).filter(Content.creator_id == creator_id).first():
        return

    for platform in ["YouTube", "Instagram"]:
        for item in SocialMediaService.generate_mock_platform_data(platform):
            title = item["content_title"]
            db.add(
                Content(
                    creator_id=creator_id,
                    platform=platform,
                    external_content_id=f"{platform.lower()}_{title.lower().replace(' ', '_')}_{random.randint(1000, 9999)}",
                    content_title=title,
                    views=item["views"],
                    likes=item["likes"],
                    comments=item["comments"],
                    shares=item["shares"],
                    saves=item.get("saves", 0),
                    watch_time=item.get("watch_time", 0.0),
                    reach=item["reach"],
                    published_date=item["published_date"],
                )
            )
    db.commit()


@app.get("/content-analytics/overview")
def content_analytics_overview(
    creator_id: int = Query(1),
    db: Session = Depends(get_db),
):
    ensure_demo_creator_and_content(db, creator_id=creator_id)
    summary = AnalyticsService.get_kpi_summary(db, creator_id=creator_id, platform="All")
    latest = (
        db.query(Content)
        .filter(Content.creator_id == creator_id)
        .order_by(Content.views.desc())
        .first()
    )
    return {
        "total_views": summary["total_views"],
        "total_likes": summary["total_likes"],
        "total_comments": summary["total_comments"],
        "top_performing_video": latest.content_title if latest else None,
        "average_engagement_rate": summary["average_engagement_rate"],
    }


@app.get("/youtube/dashboard")
def youtube_dashboard(
    creator_id: int = Query(1),
    db: Session = Depends(get_db),
):
    ensure_demo_creator_and_content(db, creator_id=creator_id)
    records = (
        db.query(Content)
        .filter(Content.creator_id == creator_id, func.lower(Content.platform) == "youtube")
        .order_by(Content.views.desc())
        .limit(10)
        .all()
    )
    return {
        "videos": [
            {
                "title": item.content_title,
                "views": item.views,
                "likes": item.likes,
                "comments": item.comments,
                "published_date": item.published_date.isoformat() if item.published_date else None,
            }
            for item in records
        ]
    }


@app.get("/")
def root():
    return {
        "message": "Creator Analytics API is running successfully!",
        "docs": "/docs",
    }
