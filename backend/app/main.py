from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import Base, engine
from app.routers import dashboard, users
from app.routers.audience import router as audience_router
from app.routers.content import router as content_router
from app.routers.social import router as social_router
from app.routers.analytics import router as analytics_router
from app.routers.revenue import router as revenue_router
from app.routers.sponsorship import router as sponsorship_router
from app.api.user_api import router as user_practice_router
from app.models import practice_user
from app.models import audience, growth
from app.models import content
from app.models import revenue, sponsorship

Base.metadata.create_all(bind=engine)

app = FastAPI(title="CreatorIQ API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(users.router)
app.include_router(dashboard.router)
app.include_router(user_practice_router)
app.include_router(audience_router)
app.include_router(content_router)
app.include_router(social_router)
app.include_router(analytics_router)
app.include_router(revenue_router)
app.include_router(sponsorship_router)

@app.get("/")
def root():
    return {"status": "CreatorIQ API running"}