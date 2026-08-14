from dotenv import load_dotenv

load_dotenv()

from fastapi import FastAPI
from app.db.database import Base, engine
from app.routers import analytics, audience, auth, content  # Added audience

# Import models so SQLAlchemy creates tables on startup
from app.models import audience as audience_model
from app.models import growth as growth_model

# Create tables in PostgreSQL
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Creator Analytics & Audience Growth Dashboard")

# Include Routers
app.include_router(auth.router)
app.include_router(content.router)
app.include_router(analytics.router)
app.include_router(audience.router)  # Registered audience router


@app.get("/")
def root():
    return {"message": "Creator Analytics API is running!"}