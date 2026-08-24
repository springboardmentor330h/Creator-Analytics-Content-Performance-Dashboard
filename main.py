from fastapi import FastAPI

from app.routers.users import router as user_router
from app.routers.auth import router as auth_router
from app.routers.content import router as content_router
from app.routers.analytics import router as analytics_router
from app.routers.audience import router as audience_router
from app.routers.social import router as social_router
from app.routers.revenue import router as revenue_router
from app.routers.sponsorship import router as sponsorship_router

app = FastAPI(title="Creator Analytics Content Performance Dashboard")


app.include_router(user_router)
app.include_router(auth_router)
app.include_router(content_router)
app.include_router(analytics_router)
app.include_router(audience_router)
app.include_router(social_router)
app.include_router(revenue_router)
app.include_router(sponsorship_router)


@app.get("/")
def root():
    return {
        "message": "API is running!"
    }