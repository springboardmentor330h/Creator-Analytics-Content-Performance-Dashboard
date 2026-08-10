from fastapi import FastAPI

from app.db.database import Base, engine
# Import models to ensure they are registered with Base metadata
import app.models.user  # noqa: F401
from app.routers import analytics, audience, auth, content, revenue, users

# Automatically create PostgreSQL tables on app boot
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="CreatorIQ Backend API",
    description="Backend service for CreatorIQ platform",
    version="1.0.0",
)

# Register All Routers
app.include_router(users.router)
app.include_router(auth.router)
app.include_router(analytics.router)
app.include_router(audience.router)
app.include_router(content.router)
app.include_router(revenue.router)


@app.get("/")
def root():
    return {"message": "Welcome to CreatorIQ API"}