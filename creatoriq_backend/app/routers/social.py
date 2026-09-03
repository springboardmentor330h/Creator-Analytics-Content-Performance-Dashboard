"""Router for simulated social media connections and data synchronization."""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.auth import get_current_user
from app.db.database import get_db
from app.models.user import User
from typing import Optional

from app.schemas.social_connection import (
    ConnectedPlatformsResponse,
    InstagramSyncRequest,
    InstagramSyncResponse,
    PlatformConnectRequest,
    PlatformConnectResponse,
    PlatformSyncRequest,
    PlatformSyncResponse,
    YouTubeSyncRequest,
    YouTubeSyncResponse,
)
from app.services.instagram_service import sync_instagram_data
from app.services.social_media import (
    connect_platform,
    get_connected_platforms,
    sync_platform_data,
)
from app.services.youtube_service import sync_youtube_data

router = APIRouter(prefix="/social", tags=["Social"])


@router.post("/connect", response_model=PlatformConnectResponse)
@router.post("/api/social/connect", response_model=PlatformConnectResponse, include_in_schema=False)
def connect_social_platform(
    payload: PlatformConnectRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Simulate connecting a social media platform account."""
    try:
        return connect_platform(db, current_user, payload.platform, payload.account_name)
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(exc),
        ) from exc


@router.get("/platforms", response_model=ConnectedPlatformsResponse)
@router.get("/api/social/platforms", response_model=ConnectedPlatformsResponse, include_in_schema=False)
def list_connected_platforms(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """List all connected social media platforms for the authenticated user."""
    connected = get_connected_platforms(db, current_user)
    return {"platforms": connected}


@router.post("/sync", response_model=PlatformSyncResponse)
@router.post("/api/social/sync", response_model=PlatformSyncResponse, include_in_schema=False)
def sync_social_platform(
    payload: PlatformSyncRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Synchronize simulated social media data into Content table for the connected platform."""
    try:
        return sync_platform_data(db, current_user, payload.platform)
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(exc),
        ) from exc


@router.post("/youtube/sync", response_model=YouTubeSyncResponse)
@router.post("/api/social/youtube/sync", response_model=YouTubeSyncResponse, include_in_schema=False)
def sync_youtube(
    payload: Optional[YouTubeSyncRequest] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Synchronize YouTube Data API v3 content into PostgreSQL with duplicate handling."""
    channel_id = payload.channel_id if payload else None
    query = payload.query if payload else None
    max_results = payload.max_results if payload and payload.max_results else 10
    api_key = payload.api_key if payload else None
    account_name = payload.account_name if payload else None
    return sync_youtube_data(
        db=db,
        user=current_user,
        channel_id=channel_id,
        query=query,
        max_results=max_results,
        api_key=api_key,
        account_name=account_name,
    )


@router.post("/instagram/sync", response_model=InstagramSyncResponse)
@router.post("/api/social/instagram/sync", response_model=InstagramSyncResponse, include_in_schema=False)
def sync_instagram(
    payload: Optional[InstagramSyncRequest] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Synchronize Instagram Graph API content into PostgreSQL with duplicate handling."""
    account_id = payload.account_id if payload else None
    max_results = payload.max_results if payload and payload.max_results else 10
    return sync_instagram_data(
        db=db,
        user=current_user,
        account_id=account_id,
        max_results=max_results,
    )
