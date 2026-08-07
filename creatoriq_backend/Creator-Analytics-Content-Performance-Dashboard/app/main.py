from fastapi import FastAPI
from app.routers import auth

app = FastAPI(title="Creator Analytics Content Performance Dashboard")

# Include Auth Router
app.include_router(auth.router)


@app.get("/")
def root():
    return {"message": "API is running!"}