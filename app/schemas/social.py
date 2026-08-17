from pydantic import BaseModel, Field


class PlatformConnectRequest(BaseModel):
    platform: str = Field(..., example="YouTube")
    account_name: str = Field(..., example="DemoCreator")


class SyncRequest(BaseModel):
    platform: str = Field(..., example="YouTube")
    creator_id: int = Field(default=1, description="Target creator ID")