from pydantic import BaseModel, Field


class PlatformConnectRequest(BaseModel):
    platform: str = Field(..., json_schema_extra={"example": "YouTube"})
    account_name: str = Field(..., json_schema_extra={"example": "DemoCreator"})


class SyncRequest(BaseModel):
    platform: str = Field(..., json_schema_extra={"example": "YouTube"})
    creator_id: int = Field(default=1, description="Target creator ID")


class YouTubeSyncRequest(BaseModel):
    channel_id: str = Field(
        ...,
        json_schema_extra={"example": "UC_x5XG1OV2P6uZZ5FSM9Ttw"},
        description="YouTube Channel ID",
    )
    creator_id: int = Field(default=1, description="Target creator ID")
    max_results: int = Field(
        default=10, ge=1, le=50, description="Number of recent videos to sync"
    )


class InstagramSyncRequest(BaseModel):
    account_id: str = Field(
        ..., json_schema_extra={"example": "17841400012345678"}, description="Instagram account or media node id"
    )
    access_token: str = Field(..., description="Instagram Graph API access token")
    creator_id: int = Field(default=1, description="Target creator ID")
    max_results: int = Field(default=10, ge=1, le=20, description="Number of recent posts to sync")