from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.db.database import Base, engine
from app import models
from app.routers import auth,users,content,analytics,audience,revenue,social,notifications,reports

Base.metadata.create_all(bind=engine)

app=FastAPI(title="CreatorIQ - Creator Analytics & Content Performance Dashboard",version="2.0.0")
app.add_middleware(CORSMiddleware, allow_origins=["http://localhost:5173","http://127.0.0.1:5173"], allow_credentials=True, allow_methods=["*"], allow_headers=["*"])

app.include_router(auth.router)
app.include_router(users.router)
app.include_router(content.router)
app.include_router(analytics.router)
app.include_router(audience.router)
app.include_router(revenue.router)
app.include_router(social.router)
app.include_router(notifications.router)
app.include_router(reports.router)

@app.get("/")
def root():
    return {"message":"CreatorIQ API is running","docs":"/docs"}
