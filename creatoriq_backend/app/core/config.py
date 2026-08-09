import os
from dotenv import load_dotenv

load_dotenv()

SECRET_KEY = os.getenv(
    "SECRET_KEY",
    "change-this-secret-key-in-production"
)

YOUTUBE_API_KEY = os.getenv("YOUTUBE_API_KEY")

ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30