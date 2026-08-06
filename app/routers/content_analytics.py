from datetime import datetime, timezone
import uuid
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status

from app.core.auth import get_current_user
from app.schemas.content_analytics import (
    ContentComparisonRequest,
    ContentCreate,
    ContentMetrics,
    ContentResponse,
    ReachAnalysisResponse,
    TrendDataPoint,
)

router = APIRouter(prefix="/analytics", tags=["Content Analytics"])

# Simulated Database for Content
db_content = {}


def calculate_engagement_rate(metrics: ContentMetrics) -> float:
    """Calculates engagement rate: ((likes + comments + shares + saves) / reach) * 100"""
    if metrics.reach == 0:
        return 0.0
    total_engagements = metrics.likes + metrics.comments + metrics.shares + metrics.saves
    return round((total_engagements / metrics.reach) * 100, 2)


# ==========================================
# (i) Track Content Performance
# ==========================================
@router.post("/content", response_model=ContentResponse, status_code=status.HTTP_201_CREATED)
def track_content(
    content_data: ContentCreate,
    current_user: dict = Depends(get_current_user)
):
    """Tracks a new content item and automatically calculates its engagement rate."""
    content_id = str(uuid.uuid4())[:8]

    # Calculate engagement rate automatically
    calculated_er = calculate_engagement_rate(content_data.metrics)
    content_data.metrics.engagement_rate = calculated_er

    content_entry = ContentResponse(
        content_id=content_id,
        title=content_data.title,
        platform=content_data.platform,
        content_type=content_data.content_type,
        created_at=datetime.now(timezone.utc),
        metrics=content_data.metrics,
    )

    db_content[content_id] = content_entry
    return content_entry


@router.get("/content/{content_id}", response_model=ContentResponse)
def get_content_performance(
    content_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Fetches performance metrics for a specific piece of content."""
    content = db_content.get(content_id)
    if not content:
        raise HTTPException(status_code=404, detail="Content not found")
    return content


# ==========================================
# (ii) Engagement Monitoring
# ==========================================
@router.get("/engagement", response_model=dict)
def get_engagement_monitoring(current_user: dict = Depends(get_current_user)):
    """Provides overall engagement health and totals across all tracked content."""
    if not db_content:
        return {"message": "No content data available"}

    total_likes = sum(c.metrics.likes for c in db_content.values())
    total_comments = sum(c.metrics.comments for c in db_content.values())
    total_shares = sum(c.metrics.shares for c in db_content.values())
    total_saves = sum(c.metrics.saves for c in db_content.values())
    avg_engagement_rate = sum(c.metrics.engagement_rate for c in db_content.values()) / len(db_content)

    return {
        "total_interactions": total_likes + total_comments + total_shares + total_saves,
        "likes": total_likes,
        "comments": total_comments,
        "shares": total_shares,
        "saves": total_saves,
        "average_engagement_rate": round(avg_engagement_rate, 2),
    }


# ==========================================
# (iii) Content Comparison Dashboard
# ==========================================
@router.post("/compare", response_model=List[ContentResponse])
def compare_content(
    payload: ContentComparisonRequest,
    current_user: dict = Depends(get_current_user)
):
    """Compares multiple pieces of content side-by-side using their IDs."""
    results = [db_content[cid] for cid in payload.content_ids if cid in db_content]
    if not results:
        raise HTTPException(status_code=404, detail="None of the specified content IDs were found")
    return results


# ==========================================
# (iv) Top-Performing Content Reports
# ==========================================
@router.get("/top-performing", response_model=List[ContentResponse])
def get_top_performing_content(
    metric: str = Query("engagement_rate", description="Metric to rank by: views, likes, reach, engagement_rate"),
    limit: int = Query(5, ge=1, le=20),
    current_user: dict = Depends(get_current_user)
):
    """Generates a top-performing report ranked by a chosen metric."""
    if not db_content:
        return []

    sorted_content = sorted(
        db_content.values(),
        key=lambda c: getattr(c.metrics, metric, 0),
        reverse=True
    )
    return sorted_content[:limit]


# ==========================================
# (v) Reach Analysis
# ==========================================
@router.get("/reach", response_model=ReachAnalysisResponse)
def get_reach_analysis(current_user: dict = Depends(get_current_user)):
    """Analyzes total reach, average reach per post, and platform distribution."""
    if not db_content:
        return ReachAnalysisResponse(
            total_reach=0, avg_reach_per_post=0.0, total_views=0, platform_breakdown={}
        )

    total_reach = sum(c.metrics.reach for c in db_content.values())
    total_views = sum(c.metrics.views for c in db_content.values())
    platform_breakdown = {}

    for content in db_content.values():
        platform = content.platform
        platform_breakdown[platform] = platform_breakdown.get(platform, 0) + content.metrics.reach

    return ReachAnalysisResponse(
        total_reach=total_reach,
        avg_reach_per_post=round(total_reach / len(db_content), 2),
        total_views=total_views,
        platform_breakdown=platform_breakdown,
    )


# ==========================================
# (vi) Performance Trends
# ==========================================
@router.get("/trends", response_model=List[TrendDataPoint])
def get_performance_trends(current_user: dict = Depends(get_current_user)):
    """Returns aggregated historical trends for views, reach, and engagement."""
    trends = []
    for content in db_content.values():
        trends.append(
            TrendDataPoint(
                date=content.created_at.strftime("%Y-%m-%d"),
                views=content.metrics.views,
                reach=content.metrics.reach,
                engagement_rate=content.metrics.engagement_rate,
            )
        )
    return trends