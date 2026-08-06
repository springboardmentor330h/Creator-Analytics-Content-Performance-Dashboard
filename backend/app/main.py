from fastapi import FastAPI
from backend.app.db.database import Base, engine
from backend.app.routers.users import router as users_router
from backend.app.routers.auth import router as auth_router
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="CreatorIQ API"
)
app.include_router(
    users_router
)
app.include_router(
    auth_router
)

@app.get("/")
def home():
    return {
        "message": "CreatorIQ API running"
    }