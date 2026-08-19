from pydantic import BaseModel
from datetime import date as date_type
from typing import Optional


class ConnectRequest(BaseModel):
    platform: str
    account_name: str


class YouTubeSyncRequest(BaseModel):
    creator_id: int
    channel_id: Optional[str] = None
    search_query: Optional[str] = None
    max_results: int = 10


class SyncResult(BaseModel):
    platform: str
    status: str
    records_synced: int