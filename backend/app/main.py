from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import Base, engine
from app.routers import dashboard, users
from app.routers.auth_register import router as auth_register_router
from app.routers.content import router as content_router
from app.routers.audience import router as audience_router               # NEW
from app.routers.revenue import router as revenue_router                 # NEW
from app.routers.growth import router as growth_router                   # NEW
from app.routers.analytics_dashboard import router as analytics_dashboard_router  # NEW
from app.api.user_api import router as user_practice_router
from app.models import practice_user
from app.models import content as content_model
from app.models import audience as audience_model                       # NEW
from app.models import revenue as revenue_model                         # NEW
from app.routers.analytics import router as analytics_router   # NEW


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
app.include_router(audience_router)             # NEW
app.include_router(revenue_router)               # NEW
app.include_router(growth_router)                # NEW
app.include_router(analytics_dashboard_router)   # NEW
app.include_router(analytics_router)   # NEW

@app.get("/")
def root():
    return {"status": "CreatorIQ API running"}