from dotenv import load_dotenv

load_dotenv()

from fastapi import FastAPI
from app.db.database import Base, engine

# Import all SQLAlchemy models to ensure tables are created on startup
from app.models import audience, content, growth, user

# Import Routers
from app.routers import analytics, audience as audience_router, content as content_router, social

app = FastAPI(
    title="Creator Analytics & Content Performance Dashboard",
    description="Backend API for tracking multi-platform creator metrics, audience analytics, and performance growth.",
    version="4.0.0",
)

# Create all database tables in PostgreSQL if they don't exist
Base.metadata.create_all(bind=engine)

# Register Application Routers
app.include_router(content_router.router)
app.include_router(analytics.router)
app.include_router(audience_router.router)
app.include_router(social.router)


@app.get("/")
def root():
    return {
        "message": "Creator Analytics API is running successfully!",
        "docs": "/docs",
    }