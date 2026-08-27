import os
from functools import lru_cache
from pydantic import AnyHttpUrl, Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=os.path.join(os.path.dirname(os.path.dirname(__file__)), '..', '.env'),
        env_file_encoding='utf-8',
        extra='allow',
    )

    DATABASE_URL: str = ...
    JWT_SECRET_KEY: str = ...
    JWT_ALGORITHM: str = 'HS256'
    JWT_EXPIRE_MINUTES: int = 1440
    FRONTEND_URL: AnyHttpUrl = 'http://localhost:5173'
    YOUTUBE_API_KEY: str | None = None

    # Social Token Encryption Key
    SOCIAL_TOKEN_ENCRYPTION_KEY: str | None = None

    # Platform OAuth Credentials
    GOOGLE_CLIENT_ID: str | None = None
    GOOGLE_CLIENT_SECRET: str | None = None
    GOOGLE_REDIRECT_URI: str | None = None
    YOUTUBE_CLIENT_ID: str | None = None
    YOUTUBE_CLIENT_SECRET: str | None = None

    META_CLIENT_ID: str | None = None
    META_CLIENT_SECRET: str | None = None
    META_REDIRECT_URI: str | None = None

    TIKTOK_CLIENT_KEY: str | None = None
    TIKTOK_CLIENT_SECRET: str | None = None
    TIKTOK_REDIRECT_URI: str | None = None

    X_CLIENT_ID: str | None = None
    X_CLIENT_SECRET: str | None = None
    X_REDIRECT_URI: str | None = None

    LINKEDIN_CLIENT_ID: str | None = None
    LINKEDIN_CLIENT_SECRET: str | None = None
    LINKEDIN_REDIRECT_URI: str | None = None


@lru_cache()
def get_settings() -> Settings:
    return Settings()
