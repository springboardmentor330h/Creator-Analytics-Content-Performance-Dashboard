from dotenv import load_dotenv

# Load environment variables from .env before importing routers & services
load_dotenv()

from fastapi import FastAPI
from app.routers import auth, content_analytics, youtube

app = FastAPI(title="Creator Analytics Content Performance Dashboard")

# Include Routers
app.include_router(auth.router)
app.include_router(content_analytics.router)
app.include_router(youtube.router)


@app.get("/")
def root():
    return {"message": "Creator Analytics API is running!"}