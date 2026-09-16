from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.core.auth import require_roles
from app.db.database import get_db
from app.models.user import UserRole
from app.services.admin_service import (
    get_platform_overview,
    get_recent_signups,
    get_top_content_by_platform,
    get_top_creators,
)

router = APIRouter(
    prefix="/admin",
    tags=["Admin"],
    dependencies=[Depends(require_roles(UserRole.ADMINISTRATOR))],
)


@router.get("/overview")
def admin_overview(db: Session = Depends(get_db)):
    """Platform-wide snapshot: user counts by role, content volume, engagement."""
    return get_platform_overview(db)


@router.get("/top-creators")
def admin_top_creators(
    limit: int = Query(10, ge=1, le=50),
    db: Session = Depends(get_db),
):
    """Ranks creators by total views across all their synced content."""
    return get_top_creators(db, limit=limit)


@router.get("/top-content")
def admin_top_content_by_platform(
    limit_per_platform: int = Query(3, ge=1, le=10),
    db: Session = Depends(get_db),
):
    """Top performing content, grouped by platform."""
    return get_top_content_by_platform(db, limit_per_platform=limit_per_platform)


@router.get("/recent-signups")
def admin_recent_signups(
    limit: int = Query(8, ge=1, le=50),
    db: Session = Depends(get_db),
):
    """Most recently registered accounts, newest first."""
    return get_recent_signups(db, limit=limit)
