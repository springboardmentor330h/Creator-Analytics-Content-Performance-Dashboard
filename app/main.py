from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.db.database import Base, engine

# Import models to ensure they are registered with Base metadata
import app.models.user  # noqa: F401
import app.models.content  # noqa: F401
import app.models.audience  # noqa: F401
import app.models.growth  # noqa: F401
import app.models.revenue  # noqa: F401
import app.models.notification  # noqa: F401

from app.routers import (
    analytics,
    audience,
    auth,
    content,
    growth,
    notifications,
    reports,
    revenue,
    social,
    users,
)

# Automatically create PostgreSQL tables on app boot
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="CreatorIQ Backend API",
    description="Backend service for CreatorIQ platform",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register All Routers
app.include_router(users.router)
app.include_router(auth.router)

app.include_router(content.router)
app.include_router(analytics.router)

app.include_router(audience.router)
app.include_router(audience.analytics_router)

app.include_router(growth.router)
app.include_router(growth.analytics_router)

app.include_router(revenue.router)
app.include_router(revenue.sponsorship_router)

app.include_router(notifications.router)
app.include_router(reports.router)
app.include_router(social.router)


@app.get("/")
def root():
    return {"message": "Welcome to CreatorIQ API"}
