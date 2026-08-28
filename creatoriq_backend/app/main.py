from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.db.init_db import init_db

from app.routers import (
    analytics,
    audience,
    auth,
    content,
    notifications,
    reports,
    revenue,
    social,
    sponsorship,
    users,
)


# ============================================================
# CREATE FASTAPI APPLICATION
# ============================================================

app = FastAPI(
    title="CreatorIQ API",
    description=(
        "Creator Analytics & Content Performance "
        "Dashboard API"
    ),
    version="1.0.0",
)


# ============================================================
# CORS — allow React frontend (Vite)
# ============================================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ============================================================
# DATABASE STARTUP
# ============================================================

@app.on_event("startup")
def startup():
    """
    Create database tables when the application starts.
    """
    init_db()


# ============================================================
# REGISTER ROUTERS
# ============================================================

app.include_router(auth.router)
app.include_router(users.router)
app.include_router(content.router)
app.include_router(analytics.router)
app.include_router(audience.router)
app.include_router(revenue.router)
app.include_router(sponsorship.router)
app.include_router(social.router)
app.include_router(notifications.router)
app.include_router(reports.router)


# ============================================================
# ROOT ENDPOINT
# ============================================================

@app.get("/")
def root():
    return {
        "message": "CreatorIQ API is running",
        "version": "1.0.0",
    }


# ============================================================
# HEALTH CHECK
# ============================================================

@app.get("/health")
def health_check():
    return {
        "status": "healthy",
    }