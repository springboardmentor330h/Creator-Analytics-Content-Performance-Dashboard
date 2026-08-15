from fastapi import FastAPI

from app.db.database import Base, engine
# Import models to ensure they are registered with Base metadata
import app.models.user  # noqa: F401
import app.models.content
from app.routers import auth, content, users, analytics

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


app.include_router(content.router)
app.include_router(analytics.router)



@app.get("/")
def root():
    return {"message": "Welcome to CreatorIQ API"}