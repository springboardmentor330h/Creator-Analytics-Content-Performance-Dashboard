from fastapi import FastAPI

from app.db.database import engine, Base
from app.models import user
from app.routers.users import router as users_router


Base.metadata.create_all(bind=engine)

app = FastAPI(title="CreatorIQ API")


app.include_router(users_router)


@app.get("/")
def home():
    return {
        "message": "CreatorIQ API connected successfully"
    }