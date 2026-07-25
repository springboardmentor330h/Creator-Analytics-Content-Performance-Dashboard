from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# 1. Create the app instance
app = FastAPI()

# 2. Add middleware (must be after 'app' is created)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:5174",
        "http://localhost:5175",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 3. Add routes
@app.get("/")
def read_root():
    return {"message": "Hello World"}   