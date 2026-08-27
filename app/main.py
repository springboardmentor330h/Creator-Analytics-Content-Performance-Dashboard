from dotenv import load_dotenv

load_dotenv()

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.db.database import Base, engine

# Import the models module to ensure all ORM relationships register with Base.metadata
import app.models

# Import Routers
from app.routers import (
    analytics,
    audience as audience_router,
    content as content_router,
    notification,
    report,
    revenue,
    social,
    sponsorship,
    users,  # Added users router
)

app = FastAPI(
    title="CreatorIQ: Creator Analytics & Content Performance Dashboard",
    description="Backend API for tracking multi-platform creator metrics, audience analytics, and performance growth.",
    version="5.0.0",
)

# Configure CORS Middleware
origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["Content-Disposition"],  # Required for PDF & Excel browser downloads
)

# Create all database tables in PostgreSQL if they don't exist
Base.metadata.create_all(bind=engine)

# Register Application Routers
app.include_router(users.router)  # Registered users router
app.include_router(content_router.router)
app.include_router(analytics.router)
app.include_router(audience_router.router)
app.include_router(social.router)
app.include_router(sponsorship.router)  # Registered sponsorship router
app.include_router(revenue.router)  # Registered revenue router
app.include_router(notification.router)  # Registered notification router
app.include_router(report.router)  # Registered report router


@app.get("/")
def root():
    return {
        "message": "Creator Analytics API is running successfully!",
        "docs": "/docs",
    }