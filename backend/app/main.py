from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import Base, engine
from app.routers import dashboard, users
from app.routers.audience import router as audience_router
from app.routers.content import router as content_router
from app.api.user_api import router as user_practice_router
from app.models import practice_user   # NEW — registers PracticeUser table with Base
from app.models import audience, growth  # NEW — registers Audience and Growth tables with Base
from app.models import content  # NEW — registers Content table with Base

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

@app.get("/")
def root():
    return {"status": "CreatorIQ API running"}