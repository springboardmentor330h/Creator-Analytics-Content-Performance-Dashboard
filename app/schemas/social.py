from pydantic import BaseModel


class SocialConnectRequest(BaseModel):
    platform: str
    account_name: str


class SocialConnectResponse(BaseModel):
    message: str

class SocialSyncRequest(BaseModel):
    platform: str


class SocialSyncResponse(BaseModel):
    message: str
    platform: str
    records_added: int

class YouTubeSyncRequest(BaseModel):
    channel_id: str
    max_results: int = 10


class YouTubeSyncResponse(BaseModel):
    platform: str
    status: str
    records_synced: int