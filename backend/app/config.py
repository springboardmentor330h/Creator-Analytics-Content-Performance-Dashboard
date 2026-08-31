from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    DATABASE_URL: str
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
    YOUTUBE_API_KEY: str = ""
    INSTAGRAM_ACCESS_TOKEN: str = ""          
    INSTAGRAM_BUSINESS_ACCOUNT_ID: str = "" 

    class Config:
        env_file = ".env"

settings = Settings()