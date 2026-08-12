from dotenv import load_dotenv

load_dotenv()

from fastapi import FastAPI
from app.db.database import Base, engine
from app.routers import analytics, auth, content  # Added analytics import

# Create tables in PostgreSQL
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Creator Analytics Content Performance Dashboard")

# Include Routers
app.include_router(auth.router)
app.include_router(content.router)
app.include_router(analytics.router)  # Registered analytics router


@app.get("/")
def root():
    return {"message": "Creator Analytics API is running!"}