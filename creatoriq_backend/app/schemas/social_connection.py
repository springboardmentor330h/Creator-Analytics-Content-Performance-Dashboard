from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict, Field


class SocialConnectionBase(BaseModel):
    platform: str
    platform_user_id: Optional[str] = None
    platform_username: Optional[str] = None
    display_name: Optional[str] = None
    profile_url: Optional[str] = None
    scopes: Optional[str] = None
    status: str = 'not_configured'


class SocialConnectionCreate(SocialConnectionBase):
    user_id: int


class SocialConnectionUpdate(BaseModel):
    platform_username: Optional[str] = None
    display_name: Optional[str] = None
    profile_url: Optional[str] = None
    status: Optional[str] = None
    scopes: Optional[str] = None
    last_synced_at: Optional[datetime] = None


class SocialConnectionRead(SocialConnectionBase):
    id: int
    user_id: int
    platform: str
    platform_user_id: Optional[str] = None
    platform_username: Optional[str] = None
    display_name: Optional[str] = None
    profile_url: Optional[str] = None
    scopes: Optional[str] = None
    status: str
    last_synced_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class OAuthInitResponse(BaseModel):
    platform: str
    configured: bool
    authorization_url: Optional[str] = None
    state: Optional[str] = None
    message: Optional[str] = None


class SyncResultResponse(BaseModel):
    platform: str
    status: str
    last_synced_at: Optional[datetime] = None
    items_synced: int = 0
    message: str
