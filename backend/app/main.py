"""
Application entrypoint.
Run with: uvicorn app.main:app --reload
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.db.session import Base, engine
from app.routers import (
    auth, users, content, audience, platform_analytics, youtube,
    revenue, sponsorships, notifications, reports, instagram,
)

# Import models so SQLAlchemy's Base knows about them before create_all().
from app.models import (
    user, content as content_model, audience as audience_model,
    revenue as revenue_model, notification as notification_model,
)  # noqa: F401

app = FastAPI(
    title=settings.APP_NAME,
    description="Creator Analytics & Content Performance Dashboard API",
    version="1.0.0",
)

# Allow the React frontend (different origin) to call this API.
# Both localhost and 127.0.0.1 are allowed: browsers treat them as
# DIFFERENT origins even though they resolve to the same machine, and
# which one a dev server binds to varies by OS/network config -- only
# allowing one caused real CORS failures during manual testing.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def on_startup():
    # As of Sprint 6, Alembic migrations (see alembic/) are the source
    # of truth for schema in real dev/production use — run
    # `alembic upgrade head` before starting the app.
    #
    # create_all() still runs here as a safety net: it's a no-op against
    # a DB that's already current (it only creates missing tables), and
    # it's what the test suite relies on (tests use a throwaway in-memory
    # SQLite DB that intentionally never runs migrations, for speed).
    Base.metadata.create_all(bind=engine)


app.include_router(auth.router)
app.include_router(users.router)
app.include_router(content.router)
app.include_router(audience.router)
app.include_router(platform_analytics.router)
app.include_router(youtube.router)
app.include_router(revenue.router)
app.include_router(sponsorships.router)
app.include_router(notifications.router)
app.include_router(reports.router)
app.include_router(instagram.router)


@app.get("/")
def root():
    return {"message": "CreatorIQ API running", "docs": "/docs"}
