from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import Optional

from backend.app.db.database import get_db
from backend.app.schemas.social import (
    SocialConnectRequest,
    SocialConnectResponse,
    ConnectedPlatformsResponse,
    SocialSyncRequest,
    SocialSyncResponse
)
from backend.app.services.social_media import SocialMediaService

router = APIRouter(
    prefix="/social",
    tags=["Social Media Workflow"]
)

@router.post("/connect", response_model=SocialConnectResponse, status_code=status.HTTP_200_OK)
@router.post("/connect/", response_model=SocialConnectResponse, status_code=status.HTTP_200_OK)
def connect_platform(payload: SocialConnectRequest):
    """
    Simulated platform connection workflow.
    """
    res = SocialMediaService.connect_account(payload.platform, payload.account_name)
    return res

@router.get("/platforms", response_model=ConnectedPlatformsResponse)
@router.get("/platforms/", response_model=ConnectedPlatformsResponse)
def get_connected_platforms():
    """
    Returns list of connected social media platforms.
    """
    platforms = SocialMediaService.get_connected_platforms()
    return {"platforms": platforms}

@router.post("/sync", response_model=SocialSyncResponse)
@router.post("/sync/", response_model=SocialSyncResponse)
def sync_social_data(payload: Optional[SocialSyncRequest] = None, platform: Optional[str] = None, db: Session = Depends(get_db)):
    """
    Multi-platform synchronization workflow:
    Fetches platform data -> processes -> stores in PostgreSQL.
    """
    target_platform = (payload.platform if payload and payload.platform else platform)
    res = SocialMediaService.sync_platform_data(db, platform=target_platform)
    return res
