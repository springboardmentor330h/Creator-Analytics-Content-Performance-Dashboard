"""
Central configuration for CreatorIQ backend.
All secrets/config come from environment variables (.env), never hardcoded.
"""
from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    # App
    APP_NAME: str = "CreatorIQ"
    ENVIRONMENT: str = "development"

    # Database
    DATABASE_URL: str = "postgresql://postgres:postgres@localhost:5432/creatoriq"

    # JWT Auth
    SECRET_KEY: str = "change-this-secret-key-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 1 day

    # YouTube API (used later in Sprint 5)
    YOUTUBE_API_KEY: str = ""

    class Config:
        env_file = ".env"
        case_sensitive = True


@lru_cache()
def get_settings() -> Settings:
    """
    lru_cache means this function's return value is computed once and
    reused on every later call — so we don't re-parse .env repeatedly.
    """
    return Settings()


settings = get_settings()
