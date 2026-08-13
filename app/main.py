from fastapi import FastAPI
from app.routers import auth
from app.routers.content import router as content_router
from app.routers.analytics import router as analytics_router

app = FastAPI(title="Creator Analytics Content Performance Dashboard")

app.include_router(auth.router)
app.include_router(content_router)
app.include_router(analytics_router)

@app.get("/")
def root():
    return {"message": "API is running!"}