from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.app.db.database import Base, engine
from backend.app.routers.users import router as users_router
from backend.app.routers.auth import router as auth_router
from backend.app.routers.content import router as content_router
from backend.app.routers.analytics import router as analytics_router
from backend.app.routers.audience import router as audience_router

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="CreatorIQ API"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(
    users_router
)
app.include_router(
    auth_router
)
app.include_router(
    content_router
)
app.include_router(
    analytics_router
)
app.include_router(
    audience_router
)

@app.get("/")
def home():
    return {
        "message": "CreatorIQ API running"
    }