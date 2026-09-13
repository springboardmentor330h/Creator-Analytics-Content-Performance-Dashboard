from pydantic import BaseModel, Field

class SocialConnect(BaseModel):
    creator_id: int = Field(1, ge=1)
    platform: str
    account_name: str

class YoutubeSyncRequest(BaseModel):
    creator_id: int = Field(1, ge=1)
    channel_id: str | None = None
    max_results: int = Field(10, ge=1, le=50)
