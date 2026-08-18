from pydantic import BaseModel, Field
from typing import List, Optional

class SocialConnectRequest(BaseModel):
    platform: str = Field(..., min_length=1)
    account_name: str = Field(..., min_length=1)

class SocialConnectResponse(BaseModel):
    message: str

class ConnectedPlatformsResponse(BaseModel):
    platforms: List[str]

class SocialSyncRequest(BaseModel):
    platform: Optional[str] = None

class SocialSyncResponse(BaseModel):
    message: str
    platform: str
    synced_records: int
