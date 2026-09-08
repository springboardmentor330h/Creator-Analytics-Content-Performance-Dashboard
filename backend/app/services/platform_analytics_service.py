"""
Normalized multi-platform analytics.

DESIGN: only YouTube has real data right now (from Content and
AudienceGrowth records a creator has actually entered). Instagram and
TikTok fall back to the mock service. Both paths produce the exact same
PlatformSnapshot shape, so every function below (comparison, cross-
platform KPIs, chart data) works identically regardless of which
platforms are real vs mocked — and stays correct once Sprint 5 replaces
YouTube's mock-equivalent with the real API, or a future sprint adds
real Instagram/TikTok services.
"""
import uuid
from typing import List
from sqlalchemy.orm import Session

from app.models.content import Platform
from app.services import content_service, audience_service, mock_platform_service

REAL_DATA_PLATFORMS = {Platform.youtube}


def get_platform_snapshot(db: Session, creator_id: uuid.UUID, platform: Platform) -> dict:
    if platform not in REAL_DATA_PLATFORMS:
        return mock_platform_service.get_mock_platform_snapshot(platform)

    # Build a real snapshot from actual DB records for this platform.
    content_items, total_content = content_service.list_content(
        db, creator_id, platform=platform, skip=0, limit=1000
    )
    kpi = content_service.get_kpi_summary(db, creator_id)

    growth_summary = audience_service.get_growth_summary(db, creator_id, platform, days=30)
    followers = growth_summary["current_followers"] if growth_summary else 0
    growth_rate = growth_summary["growth_rate_percent"] if growth_summary else 0.0

    total_reach = sum(c.reach for c in content_items)
    if content_items:
        avg_rate = round(
            sum(content_service.calculate_engagement_rate(c) for c in content_items)
            / len(content_items),
            2,
        )
    else:
        avg_rate = 0.0

    return {
        "platform": platform,
        "followers": followers,
        "total_content": total_content,
        "total_reach": total_reach,
        "avg_engagement_rate": avg_rate,
        "growth_rate_percent": growth_rate,
        "is_mock_data": False,
    }


def get_all_platform_snapshots(db: Session, creator_id: uuid.UUID) -> List[dict]:
    return [get_platform_snapshot(db, creator_id, p) for p in Platform]


def get_cross_platform_kpis(db: Session, creator_id: uuid.UUID) -> dict:
    snapshots = get_all_platform_snapshots(db, creator_id)

    total_followers = sum(s["followers"] for s in snapshots)
    total_content = sum(s["total_content"] for s in snapshots)
    total_reach = sum(s["total_reach"] for s in snapshots)

    platforms_with_content = [s for s in snapshots if s["total_content"] > 0]
    overall_avg_rate = (
        round(sum(s["avg_engagement_rate"] for s in platforms_with_content) / len(platforms_with_content), 2)
        if platforms_with_content
        else 0.0
    )

    return {
        "total_followers": total_followers,
        "total_content": total_content,
        "total_reach": total_reach,
        "overall_avg_engagement_rate": overall_avg_rate,
        "platforms_tracked": len(snapshots),
    }


def get_growth_comparison(db: Session, creator_id: uuid.UUID) -> List[dict]:
    snapshots = get_all_platform_snapshots(db, creator_id)
    return [
        {"platform": s["platform"], "growth_rate_percent": s["growth_rate_percent"]}
        for s in snapshots
    ]


def get_engagement_comparison(db: Session, creator_id: uuid.UUID) -> List[dict]:
    snapshots = get_all_platform_snapshots(db, creator_id)
    return [
        {"platform": s["platform"], "avg_engagement_rate": s["avg_engagement_rate"]}
        for s in snapshots
    ]
