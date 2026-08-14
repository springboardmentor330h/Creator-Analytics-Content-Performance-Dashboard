"""
Main FastAPI application.

This file:
1. Creates the FastAPI application.
2. Initializes the database.
3. Registers all routers.
"""

from fastapi import FastAPI

from app.db.init_db import init_db

from app.routers import (
    analytics,
    audience,
    auth,
    content,
    revenue,
    users
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

    version="1.0.0"
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

# Authentication APIs.
app.include_router(auth.router)

# User APIs.
app.include_router(users.router)

# Analytics APIs.
app.include_router(analytics.router)

# Audience APIs - Sprint 3.
app.include_router(audience.router)

# Content APIs.
app.include_router(content.router)

# Revenue APIs.
app.include_router(revenue.router)


# ============================================================
# ROOT ENDPOINT
# ============================================================

@app.get("/")
def root():
    """
    Basic API information.
    """

    return {
        "message": "CreatorIQ API is running",
        "version": "1.0.0"
    }


# ============================================================
# HEALTH CHECK
# ============================================================

@app.get("/health")
def health_check():
    """
    Health check endpoint.

    Useful for checking whether the API is running.
    """

    return {
        "status": "healthy"
    }