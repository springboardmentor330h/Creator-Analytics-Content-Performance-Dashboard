from uuid import UUID

from pydantic import BaseModel, Field


class SocialConnect(BaseModel):
    creator_id: UUID
    platform: str = Field(..., min_length=1)
    account_name: str = Field(..., min_length=1)


class YoutubeSyncRequest(BaseModel):
    creator_id: UUID
    channel_id: str = Field(..., min_length=1)
    max_results: int = Field(default=10, ge=1, le=50)