from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.auth import get_current_user
from app.db.database import get_db
from app.integrations import get_integration
from app.models.social_connection import SocialConnection
from app.models.user import User
from app.schemas.social_connection import (
    ConnectedPlatformsResponse,
    CreatorConnectedPlatformSummary,
    InstagramSyncRequest,
    InstagramSyncResponse,
    PlatformConnectRequest,
    PlatformConnectResponse,
    PlatformSyncRequest,
    PlatformSyncResponse,
    StandardSyncResponse,
    YouTubeSyncRequest,
    YouTubeSyncResponse,
)
from app.services.instagram_service import sync_instagram_data
from app.services.social_media import (
    connect_platform,
    get_connected_platforms,
    normalize_platform_name,
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
    """Connect a social media platform account and run initial synchronization."""
    try:
        return connect_platform(db, current_user, payload.platform, payload.account_name)
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(exc),
        ) from exc


@router.post("/{platform}/connect", response_model=PlatformConnectResponse)
@router.post("/api/social/{platform}/connect_account", response_model=PlatformConnectResponse, include_in_schema=False)
def connect_social_platform_path(
    platform: str,
    payload: Optional[PlatformConnectRequest] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Connect a specific platform account and automatically run initial synchronization."""
    account_name = payload.account_name if payload and payload.account_name else (current_user.full_name or "Creator Account")
    try:
        return connect_platform(db, current_user, platform, account_name)
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(exc),
        ) from exc


@router.get("/connections", response_model=List[CreatorConnectedPlatformSummary])
@router.get("/api/social/connections_summary", response_model=List[CreatorConnectedPlatformSummary], include_in_schema=False)
def get_creator_connections_summary(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Return list of connected platforms for the authenticated creator with account and sync metadata."""
    connections = db.query(SocialConnection).filter(
        SocialConnection.user_id == current_user.id,
        SocialConnection.status == "connected",
    ).all()

    results: List[CreatorConnectedPlatformSummary] = []
    for conn in connections:
        p_canon = normalize_platform_name(conn.platform) or conn.platform.capitalize()
        p_key = conn.platform.lower().strip()
        is_live = False
        try:
            integ = get_integration("twitter" if p_key == "x" else p_key)
            is_live = bool(integ.is_configured() or p_key == "youtube")
        except Exception:
            is_live = (p_key == "youtube")

        account_display = conn.display_name or conn.platform_username or (current_user.full_name or "Creator Account")
        results.append(
            CreatorConnectedPlatformSummary(
                platform=p_canon,
                status=conn.status,
                account_name=account_display,
                last_synced_at=conn.last_synced_at,
                connection_mode="live" if is_live else "manual",
            )
        )
    return results


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
    """Synchronize social media data into Content table for the connected platform."""
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


@router.post("/tiktok/sync", response_model=StandardSyncResponse)
@router.post("/api/social/tiktok/sync_account", response_model=StandardSyncResponse, include_in_schema=False)
def sync_tiktok(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Synchronize TikTok content into PostgreSQL with idempotent duplicate handling."""
    try:
        return sync_platform_data(db, current_user, "TikTok")
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc


@router.post("/facebook/sync", response_model=StandardSyncResponse)
@router.post("/api/social/facebook/sync_account", response_model=StandardSyncResponse, include_in_schema=False)
def sync_facebook(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Synchronize Facebook content into PostgreSQL with idempotent duplicate handling."""
    try:
        return sync_platform_data(db, current_user, "Facebook")
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc


@router.post("/linkedin/sync", response_model=StandardSyncResponse)
@router.post("/api/social/linkedin/sync_account", response_model=StandardSyncResponse, include_in_schema=False)
def sync_linkedin(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Synchronize LinkedIn content into PostgreSQL with idempotent duplicate handling."""
    try:
        return sync_platform_data(db, current_user, "LinkedIn")
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc


@router.post("/x/sync", response_model=StandardSyncResponse)
@router.post("/twitter/sync", response_model=StandardSyncResponse, include_in_schema=False)
@router.post("/api/social/x/sync_account", response_model=StandardSyncResponse, include_in_schema=False)
@router.post("/api/social/twitter/sync_account", response_model=StandardSyncResponse, include_in_schema=False)
def sync_x(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Synchronize X (Twitter) content into PostgreSQL with idempotent duplicate handling."""
    try:
        return sync_platform_data(db, current_user, "X")
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc


@router.get("/youtube/live-analytics")
@router.get("/api/social/youtube/live-analytics", include_in_schema=False)
async def get_social_youtube_live_data(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Retrieve live real-time YouTube channel and video performance metrics directly from YouTube API."""
    from app.services.youtube_live_service import get_youtube_live_analytics
    return await get_youtube_live_analytics(db=db, user=current_user)

