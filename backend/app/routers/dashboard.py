from datetime import date, timedelta

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User
from app.models.growth import Growth
from app.routers.auth import get_current_user
from app.services import analytics_service, audience_service, revenue_service

router = APIRouter(prefix="/dashboard", tags=["dashboard"])


def _latest_followers(db: Session, creator_id: int) -> int:
    """Most recent followers count from the growth table for this creator, or 0 if none."""
    latest = (
        db.query(Growth)
        .filter(Growth.creator_id == creator_id)
        .order_by(Growth.date.desc())
        .first()
    )
    return latest.followers if latest else 0


@router.get("/overview")
def overview(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """
    Returns real, database-backed KPIs for the logged-in user.

    - "creator" role: KPIs scoped to that creator's own data only
      (uses current_user.creator_id).
    - "agency" / "marketing_team" / "admin": there is no creator-to-agency
      mapping table in the schema yet, so these roles currently see
      system-wide totals across all creators. This is called out
      explicitly in the response (scope field) rather than silently
      mixing creator-level and system-level numbers.
    """
    role = current_user.role.value if hasattr(current_user.role, "value") else current_user.role

    if role == "creator":
        creator_id = current_user.creator_id
        summary = analytics_service.get_dashboard_summary(db, creator_id=creator_id)
        revenue_total = revenue_service.get_total_revenue(db, creator_id) if creator_id is not None else 0.0
        followers = _latest_followers(db, creator_id) if creator_id is not None else 0

        kpis = {
            "total_views": summary["total_views"],
            "total_likes": summary["total_likes"],
            "engagement_rate": summary["overall_engagement_rate"],
            "followers": followers,
            "revenue": revenue_total,
        }
        scope = "creator" if creator_id is not None else "none (this user has no creator_id set)"
    else:
        # No agency/creator ownership mapping exists yet in the schema.
        # Rather than fabricate per-agency numbers, we report system-wide
        # totals and say so explicitly.
        summary = analytics_service.get_dashboard_summary(db)
        followers = int(
            db.query(Growth.followers)
            .order_by(Growth.date.desc())
            .first()[0]
        ) if db.query(Growth).count() > 0 else 0

        kpis = {
            "total_views": summary["total_views"],
            "total_likes": summary["total_likes"],
            "engagement_rate": summary["overall_engagement_rate"],
            "followers_latest_sample": followers,
            "total_content_all_creators": summary["total_content"],
        }
        scope = "system-wide (no agency-to-creator mapping exists yet; showing all creators combined)"

    return {
        "message": f"Welcome, {current_user.full_name}",
        "role": role,
        "scope": scope,
        "kpis": kpis,
    }
