from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import get_settings
from app.db.database import Base, engine
import app.models  # ensure all models are imported for metadata
from app.routers.agency import router as agency_router
from app.routers.analytics import router as analytics_router
from app.routers.audience import router as audience_router
from app.routers.auth import router as auth_router
from app.routers.content import router as content_router
from app.routers.revenue import router as revenue_router
from app.routers.social import router as social_router
from app.routers.social_connections import router as social_connections_router
from app.routers.sponsorship import router as sponsorship_router
from app.routers.users import router as user_router

# Ensure tables exist
Base.metadata.create_all(bind=engine)

settings = get_settings()
frontend_origin = str(settings.FRONTEND_URL).rstrip('/')

app = FastAPI(title='CreatorIQ API')
app.add_middleware(
    CORSMiddleware,
    allow_origins=[frontend_origin, 'http://localhost:5173', 'http://127.0.0.1:5173'],
    allow_credentials=True,
    allow_methods=['*'],
    allow_headers=['*'],
)
app.include_router(auth_router)
app.include_router(user_router)
app.include_router(content_router)
app.include_router(revenue_router)
app.include_router(sponsorship_router)
app.include_router(agency_router)
app.include_router(social_connections_router)
app.include_router(social_router)
app.include_router(analytics_router)
app.include_router(audience_router)


@app.get('/')
def home():
    return {'message': 'CreatorIQ API is running'}
