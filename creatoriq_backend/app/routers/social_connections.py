from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, Request, status
from fastapi.responses import JSONResponse, RedirectResponse
from sqlalchemy.orm import Session

from app.core.auth import get_current_user, require_authenticated_user, require_role
from app.core.config import get_settings
from app.db.database import get_db
from app.models.social_connection import ALLOWED_PLATFORMS, SocialConnection
from app.models.user import User
from app.schemas.social_connection import (
    OAuthInitResponse,
    SocialConnectionRead,
    SocialConnectionUpdate,
    SyncResultResponse,
)
from app.services.social_connection_service import SocialConnectionService

router = APIRouter(prefix="/api/social", tags=["Social Connections"])


def _normalize_platform(platform: str) -> str:
    key = platform.lower().strip()
    return "twitter" if key == "x" else key


@router.get("/connections", response_model=List[SocialConnectionRead])
def get_social_connections(
    current_user: User = Depends(require_authenticated_user),
    db: Session = Depends(get_db),
):
    """Return all 6 social connection statuses for the authenticated user."""
    return SocialConnectionService.get_user_connections(db, current_user)


@router.get("/{platform}/connect", response_model=OAuthInitResponse)
def connect_platform(
    platform: str,
    current_user: User = Depends(require_authenticated_user),
):
    """Generate official OAuth authorization URL and cryptographically secure state parameter."""
    platform_key = _normalize_platform(platform)
    if platform_key not in ALLOWED_PLATFORMS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported social platform '{platform}'. Allowed platforms: {list(ALLOWED_PLATFORMS)}",
        )
    return SocialConnectionService.initiate_oauth(platform_key, current_user.id)


@router.get("/youtube/live-analytics")
@router.get("/youtube/live_analytics", include_in_schema=False)
async def get_youtube_live_data(
    current_user: User = Depends(require_authenticated_user),
    db: Session = Depends(get_db),
):
    """Retrieve live real-time YouTube channel and video performance metrics directly from YouTube API."""
    from app.services.youtube_live_service import get_youtube_live_analytics
    return await get_youtube_live_analytics(db=db, user=current_user)


@router.get("/{platform}/callback")
@router.post("/{platform}/callback")
async def oauth_callback(
    request: Request,
    platform: str,
    code: Optional[str] = Query(None),
    state: Optional[str] = Query(None),
    error: Optional[str] = Query(None),
    error_description: Optional[str] = Query(None),
    db: Session = Depends(get_db),
):
    """Handle official OAuth callback, validate state, exchange authorization code, and store encrypted connection."""
    settings = get_settings()
    frontend_url = str(settings.FRONTEND_URL).rstrip('/')

    accept_header = request.headers.get("accept", "").lower()
    wants_json = "application/json" in accept_header or request.headers.get("x-requested-with") == "XMLHttpRequest"

    platform_key = _normalize_platform(platform)
    if platform_key not in ALLOWED_PLATFORMS:
        if wants_json:
            return JSONResponse(
                status_code=status.HTTP_400_BAD_REQUEST,
                content={"status": "error", "detail": "unsupported_platform"},
            )
        redirect_url = f"{frontend_url}/social-connections?error=unsupported_platform"
        return RedirectResponse(url=redirect_url)

    if error or not code or not state:
        reason = error_description or error or "missing_code_or_state"
        if wants_json:
            return JSONResponse(
                status_code=status.HTTP_400_BAD_REQUEST,
                content={"status": "error", "detail": reason},
            )
        redirect_url = f"{frontend_url}/social-connections?error={reason}"
        return RedirectResponse(url=redirect_url)

    try:
        connection = await SocialConnectionService.process_oauth_callback(
            db=db,
            platform=platform_key,
            code=code,
            state=state,
        )
        if wants_json:
            return JSONResponse(
                status_code=status.HTTP_200_OK,
                content={
                    "status": "connected",
                    "platform": platform_key,
                    "account_name": connection.display_name or connection.platform_username,
                    "redirect_url": f"{frontend_url}/social-connections?connected={platform_key}",
                },
            )
        redirect_url = f"{frontend_url}/social-connections?connected={platform_key}"
        return RedirectResponse(url=redirect_url)
    except HTTPException as exc:
        if wants_json:
            return JSONResponse(
                status_code=exc.status_code,
                content={"status": "error", "detail": exc.detail},
            )
        redirect_url = f"{frontend_url}/social-connections?error={exc.detail}"
        return RedirectResponse(url=redirect_url)
    except Exception as exc:
        if wants_json:
            return JSONResponse(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                content={"status": "error", "detail": str(exc)},
            )
        redirect_url = f"{frontend_url}/social-connections?error={str(exc)}"
        return RedirectResponse(url=redirect_url)



@router.get("/{platform}/status", response_model=SocialConnectionRead)
def get_platform_status(
    platform: str,
    current_user: User = Depends(require_authenticated_user),
    db: Session = Depends(get_db),
):
    """Get safe connection status for a specific platform."""
    platform_key = _normalize_platform(platform)
    if platform_key not in ALLOWED_PLATFORMS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported social platform '{platform}'. Allowed platforms: {list(ALLOWED_PLATFORMS)}",
        )
    conn = SocialConnectionService.get_connection_by_platform(db, current_user.id, platform_key)
    if not conn:
        connections = SocialConnectionService.get_user_connections(db, current_user)
        conn = next((c for c in connections if c.platform.lower() == platform_key), None)
    return conn


@router.post("/{platform}/sync", response_model=SyncResultResponse)
async def sync_platform(
    platform: str,
    current_user: User = Depends(require_authenticated_user),
    db: Session = Depends(get_db),
):
    """Trigger background content analytics synchronization for a connected platform."""
    platform_key = _normalize_platform(platform)
    if platform_key not in ALLOWED_PLATFORMS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported social platform '{platform}'. Allowed platforms: {list(ALLOWED_PLATFORMS)}",
        )
    return await SocialConnectionService.sync_connection(db, current_user, platform_key)


@router.delete("/{platform}", response_model=SocialConnectionRead)
def disconnect_platform(
    platform: str,
    current_user: User = Depends(require_role("Creator", "Agency", "Administrator")),
    db: Session = Depends(get_db),
):
    """Disconnect platform and securely wipe stored OAuth tokens."""
    platform_key = _normalize_platform(platform)
    if platform_key not in ALLOWED_PLATFORMS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported social platform '{platform}'. Allowed platforms: {list(ALLOWED_PLATFORMS)}",
        )
    return SocialConnectionService.disconnect_connection(db, current_user, platform_key)


@router.put("/{platform}", response_model=SocialConnectionRead)
@router.put("/{platform}/account", response_model=SocialConnectionRead)
def update_platform_account(
    platform: str,
    payload: SocialConnectionUpdate,
    current_user: User = Depends(require_authenticated_user),
    db: Session = Depends(get_db),
):
    """Update display name, platform username, or profile url for a connected social account."""
    platform_key = _normalize_platform(platform)
    if platform_key not in ALLOWED_PLATFORMS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported social platform '{platform}'. Allowed platforms: {list(ALLOWED_PLATFORMS)}",
        )
    conn = SocialConnectionService.get_connection_by_platform(db, current_user.id, platform_key)
    if not conn:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"No connection found for {platform}. Please connect the account first.",
        )

    if payload.display_name is not None:
        conn.display_name = payload.display_name.strip()
    if payload.platform_username is not None:
        conn.platform_username = payload.platform_username.strip()
    if payload.profile_url is not None:
        conn.profile_url = payload.profile_url.strip()

    from datetime import datetime
    conn.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(conn)
    return conn

