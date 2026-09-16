from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.auth import assert_owner_or_admin, get_current_user
from app.db.database import get_db
from app.models.content import Content
from app.models.user import User, UserRole
from app.services.analytics_service import (
    get_content_engagement,
    get_top_content,
    get_platform_performance,
    get_dashboard_summary,
)

router = APIRouter(prefix="/analytics", tags=["Analytics"])


def _resolve_creator_scope(current_user: User, creator_id: int | None) -> int | None:
    """Non-admins are always scoped to themselves. Admins can pass creator_id
    to inspect a specific creator, or omit it to see aggregate data across all.
    """
    if current_user.role != UserRole.ADMINISTRATOR:
        return current_user.id
    return creator_id


@router.get("/content/{content_id}/engagement")
def content_engagement(
    content_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    content = db.query(Content).filter(Content.id == content_id).first()

    if not content:
        raise HTTPException(status_code=404, detail="Content not found")

    assert_owner_or_admin(current_user, content.creator_id)

    return get_content_engagement(db, content_id)


@router.get("/top-content")
def top_content(
    creator_id: int | None = None,
    platform: str | None = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    scope = _resolve_creator_scope(current_user, creator_id)

    return get_top_content(
        db,
        scope,
        platform,
    )


@router.get("/platform-performance")
def platform_performance(
    creator_id: int | None = None,
    platform: str | None = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    scope = _resolve_creator_scope(current_user, creator_id)

    return get_platform_performance(
        db,
        scope,
        platform,
    )


@router.get("/summary")
def dashboard_summary(
    creator_id: int | None = None,
    platform: str | None = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    scope = _resolve_creator_scope(current_user, creator_id)

    return get_dashboard_summary(
        db,
        scope,
        platform,
    )