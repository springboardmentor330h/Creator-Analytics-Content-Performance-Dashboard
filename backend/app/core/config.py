from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "CreatorIQ Multi-Platform Backend"
    API_V1_STR: str = "/api/v1"
    SECRET_KEY: str = "supersecretjwtkey_creatoriq_2026"
    DATABASE_URL: str = "postgresql://postgres:postgres@localhost:5432/creatoriq"
    PORT: int = 8000

    class Config:
        env_file = ".env"

settings = Settings()
