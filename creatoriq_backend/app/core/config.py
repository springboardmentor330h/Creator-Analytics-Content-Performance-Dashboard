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

    DATABASE_URL: str = Field(..., env='DATABASE_URL')
    JWT_SECRET_KEY: str = Field(..., env='JWT_SECRET_KEY')
    JWT_ALGORITHM: str = Field('HS256', env='JWT_ALGORITHM')
    JWT_EXPIRE_MINUTES: int = Field(1440, env='JWT_EXPIRE_MINUTES')
    FRONTEND_URL: AnyHttpUrl = Field('http://localhost:5173', env='FRONTEND_URL')

    # Social Token Encryption Key
    SOCIAL_TOKEN_ENCRYPTION_KEY: str | None = Field(None, env='SOCIAL_TOKEN_ENCRYPTION_KEY')

    # Platform OAuth Credentials
    GOOGLE_CLIENT_ID: str | None = Field(None, env='GOOGLE_CLIENT_ID')
    GOOGLE_CLIENT_SECRET: str | None = Field(None, env='GOOGLE_CLIENT_SECRET')
    GOOGLE_REDIRECT_URI: str | None = Field(None, env='GOOGLE_REDIRECT_URI')

    META_CLIENT_ID: str | None = Field(None, env='META_CLIENT_ID')
    META_CLIENT_SECRET: str | None = Field(None, env='META_CLIENT_SECRET')
    META_REDIRECT_URI: str | None = Field(None, env='META_REDIRECT_URI')

    TIKTOK_CLIENT_KEY: str | None = Field(None, env='TIKTOK_CLIENT_KEY')
    TIKTOK_CLIENT_SECRET: str | None = Field(None, env='TIKTOK_CLIENT_SECRET')
    TIKTOK_REDIRECT_URI: str | None = Field(None, env='TIKTOK_REDIRECT_URI')

    X_CLIENT_ID: str | None = Field(None, env='X_CLIENT_ID')
    X_CLIENT_SECRET: str | None = Field(None, env='X_CLIENT_SECRET')
    X_REDIRECT_URI: str | None = Field(None, env='X_REDIRECT_URI')

    LINKEDIN_CLIENT_ID: str | None = Field(None, env='LINKEDIN_CLIENT_ID')
    LINKEDIN_CLIENT_SECRET: str | None = Field(None, env='LINKEDIN_CLIENT_SECRET')
    LINKEDIN_REDIRECT_URI: str | None = Field(None, env='LINKEDIN_REDIRECT_URI')


@lru_cache()
def get_settings() -> Settings:
    return Settings()
