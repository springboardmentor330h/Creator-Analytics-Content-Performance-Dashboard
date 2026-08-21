from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import Base, engine
from app.routers import dashboard, users
from app.routers.auth_register import router as auth_register_router
from app.routers.content import router as content_router
from app.routers.audience import router as audience_router
from app.routers.revenue import router as revenue_router
from app.routers.analytics import router as analytics_router
from app.routers.analytics_dashboard import router as analytics_dashboard_router
from app.api.user_api import router as user_practice_router
from app.models import practice_user
from app.models import content as content_model
from app.models import audience as audience_model
from app.models import growth as growth_model
from app.models import revenue as revenue_model
from app.routers.growth_trends import router as growth_trends_router
from app.routers.notifications import router as notifications_router
from app.routers.reports import router as reports_router
from app.routers.social import router as social_router
from app.models import social_connection as social_connection_model
from app.routers.sponsorship import router as sponsorship_router
from app.models import sponsorship as sponsorship_model


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
app.include_router(auth_register_router, prefix="/auth", tags=["auth"])
app.include_router(content_router)
app.include_router(audience_router, tags=["audience"])
app.include_router(revenue_router)
app.include_router(analytics_router)
app.include_router(analytics_dashboard_router)
app.include_router(growth_trends_router)
app.include_router(notifications_router)
app.include_router(reports_router)
app.include_router(social_router)
app.include_router(sponsorship_router)


@app.get("/")
def root():
    return {"status": "CreatorIQ API running"}