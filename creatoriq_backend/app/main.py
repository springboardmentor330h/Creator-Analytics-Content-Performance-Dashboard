# i have removed the previous code #
# 4 August 2026 #
 
from fastapi import FastAPI
from app.db.database import engine, Base
from app.models.user import User
from app.routers.users import router as user_router
#5 august 2026
from app.routers.auth import router as auth_router

Base.metadata.create_all(bind=engine)

app = FastAPI(title="CreatorIQ API")

app.include_router(user_router)
app.include_router(auth_router)  #5 august 2026

@app.get("/")
def home():
    return {
        "message": "CreatorIQ API is running"
    }   