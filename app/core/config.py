# Application configuration
import os
from dotenv import load_dotenv

load_dotenv()


class Settings:
    """Central place for env-driven config. Loaded once at import time."""

    SECRET_KEY: str = os.getenv("SECRET_KEY", "dev-secret-change-me")
    ALGORITHM: str = os.getenv("ALGORITHM", "HS256")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = int(
        os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "60")
    )
    YOUTUBE_API_KEY: str = os.getenv("YOUTUBE_API_KEY", "")
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL",
        "postgresql://postgres:Aady@localhost:5432/Iq.db",
    )


settings = Settings()
