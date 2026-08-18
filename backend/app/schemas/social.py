from pydantic import BaseModel
from datetime import date as date_type
from typing import Optional


class ConnectRequest(BaseModel):
    platform: str
    account_name: str


class SyncRequest(BaseModel):
    creator_id: int
    platform: str
    published_date: Optional[date_type] = None