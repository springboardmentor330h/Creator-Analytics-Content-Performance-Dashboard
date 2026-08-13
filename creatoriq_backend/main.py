from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import get_settings
from app.routers.agency import router as agency_router
from app.routers.auth import router as auth_router
from app.routers.content import router as content_router
from app.routers.social_connections import router as social_connections_router
from app.routers.users import router as user_router
from app.routers.analytics import router as analytics_router

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
app.include_router(agency_router)
app.include_router(social_connections_router)
app.include_router(analytics_router)


@app.get('/')
def home():
    return {'message': 'CreatorIQ API is running'}
