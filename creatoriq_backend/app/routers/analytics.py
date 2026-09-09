from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.core.auth import get_current_user
from app.models.user import User
from app.services.analytics_service import (
    get_content_engagement,
    get_top_content,
    get_platform_performance,
    get_dashboard_summary,
    get_engagement_chart,
    get_followers_chart,
    get_platform_comparison,
)


router = APIRouter(
    prefix="/analytics",
    tags=["Analytics"],
)


def resolve_creator_id(
    creator_id: int | None,
    current_user: User,
) -> int:
    if creator_id is not None and creator_id != current_user.id:
        raise HTTPException(
            status_code=403,
            detail="You can only access your own analytics.",
        )

    return current_user.id


@router.get("/content/{content_id}/engagement")
def get_engagement(
    content_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = get_content_engagement(
        db,
        content_id,
        current_user.id,
    )

    if result is None:
        raise HTTPException(
            status_code=404,
            detail="Content not found",
        )

    return result

@router.get("/top-content")
def top_content(
    creator_id: int | None = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    creator_id = resolve_creator_id(creator_id, current_user)
    return get_top_content(db, creator_id=creator_id)
#
@router.get("/platform-performance")
def platform_performance(
    creator_id: int | None = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    creator_id = resolve_creator_id(creator_id, current_user)
    return get_platform_performance(
        db,
        creator_id,
    )
#
@router.get("/platform-comparison")
def platform_comparison(
    creator_id: int | None = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    creator_id = resolve_creator_id(creator_id, current_user)
    return get_platform_comparison(
        db,
        creator_id,
    )
    
@router.get("/chart/engagement")
def engagement_chart(
    creator_id: int | None = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    creator_id = resolve_creator_id(creator_id, current_user)
    return get_engagement_chart(db, creator_id)

@router.get("/chart/followers")
def followers_chart(
    creator_id: int | None = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    creator_id = resolve_creator_id(creator_id, current_user)
    return get_followers_chart(db, creator_id)

@router.get("/summary")
def dashboard_summary(
    creator_id: int | None = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    creator_id = resolve_creator_id(creator_id, current_user)
    return get_dashboard_summary(db, creator_id)

