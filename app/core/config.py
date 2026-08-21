from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "CreatorIQ API"
    API_V1_STR: str = "/api/v1"  # Add this line
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    DATABASE_URL: str
    YOUTUBE_API_KEY: str

    class Config:
        env_file = ".env"
        extra = "ignore"

settings = Settings()