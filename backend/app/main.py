"""
Application entrypoint.
Run with: uvicorn app.main:app --reload
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.db.session import Base, engine
from app.routers import auth, users, content, audience, platform_analytics, youtube

# Import models so SQLAlchemy's Base knows about them before create_all().
from app.models import user, content as content_model, audience as audience_model  # noqa: F401

app = FastAPI(
    title=settings.APP_NAME,
    description="Creator Analytics & Content Performance Dashboard API",
    version="1.0.0",
)

# Allow the React frontend (different port) to call this API.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def on_startup():
    # Creates tables if they don't exist. Fine for early sprints;
    # Sprint 6 introduces Alembic migrations for schema changes.
    Base.metadata.create_all(bind=engine)


app.include_router(auth.router)
app.include_router(users.router)
app.include_router(content.router)
app.include_router(audience.router)
app.include_router(platform_analytics.router)
app.include_router(youtube.router)


@app.get("/")
def root():
    return {"message": "CreatorIQ API running", "docs": "/docs"}
