from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from fastapi.responses import RedirectResponse
from sqlalchemy.orm import Session

from app.core.auth import get_current_user, require_authenticated_user, require_role
from app.core.config import get_settings
from app.db.database import get_db
from app.models.social_connection import ALLOWED_PLATFORMS, SocialConnection
from app.models.user import User
from app.schemas.social_connection import (
    OAuthInitResponse,
    SocialConnectionRead,
    SyncResultResponse,
)
from app.services.social_connection_service import SocialConnectionService

router = APIRouter(prefix="/api/social", tags=["Social Connections"])


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
    platform_key = platform.lower().strip()
    if platform_key not in ALLOWED_PLATFORMS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported social platform '{platform}'. Allowed platforms: {list(ALLOWED_PLATFORMS)}",
        )
    return SocialConnectionService.initiate_oauth(platform_key, current_user.id)


@router.get("/{platform}/callback")
async def oauth_callback(
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

    platform_key = platform.lower().strip()
    if platform_key not in ALLOWED_PLATFORMS:
        redirect_url = f"{frontend_url}/profile?tab=social&error=unsupported_platform"
        return RedirectResponse(url=redirect_url)

    if error or not code or not state:
        reason = error_description or error or "missing_code_or_state"
        redirect_url = f"{frontend_url}/profile?tab=social&error={reason}"
        return RedirectResponse(url=redirect_url)

    try:
        connection = await SocialConnectionService.process_oauth_callback(
            db=db,
            platform=platform_key,
            code=code,
            state=state,
        )
        redirect_url = f"{frontend_url}/profile?tab=social&connected={platform_key}"
        return RedirectResponse(url=redirect_url)
    except HTTPException as exc:
        redirect_url = f"{frontend_url}/profile?tab=social&error={exc.detail}"
        return RedirectResponse(url=redirect_url)
    except Exception as exc:
        redirect_url = f"{frontend_url}/profile?tab=social&error={str(exc)}"
        return RedirectResponse(url=redirect_url)


@router.get("/{platform}/status", response_model=SocialConnectionRead)
def get_platform_status(
    platform: str,
    current_user: User = Depends(require_authenticated_user),
    db: Session = Depends(get_db),
):
    """Get safe connection status for a specific platform."""
    platform_key = platform.lower().strip()
    if platform_key not in ALLOWED_PLATFORMS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported social platform '{platform}'. Allowed platforms: {list(ALLOWED_PLATFORMS)}",
        )
    conn = SocialConnectionService.get_connection_by_platform(db, current_user.id, platform_key)
    if not conn:
        connections = SocialConnectionService.get_user_connections(db, current_user)
        conn = next((c for c in connections if c.platform == platform_key), None)
    return conn


@router.post("/{platform}/sync", response_model=SyncResultResponse)
async def sync_platform(
    platform: str,
    current_user: User = Depends(require_authenticated_user),
    db: Session = Depends(get_db),
):
    """Trigger background content analytics synchronization for a connected platform."""
    platform_key = platform.lower().strip()
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
    platform_key = platform.lower().strip()
    if platform_key not in ALLOWED_PLATFORMS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported social platform '{platform}'. Allowed platforms: {list(ALLOWED_PLATFORMS)}",
        )
    return SocialConnectionService.disconnect_connection(db, current_user, platform_key)
