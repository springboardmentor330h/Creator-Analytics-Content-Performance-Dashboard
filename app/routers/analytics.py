
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.core.auth import get_current_user
from app.models.user import User

from app.schemas.analytics import (
    EngagementResponse,
    ContentComparisonResponse,
    TopPerformingContentResponse,
    ReachAnalysisResponse,
    PerformanceTrendsResponse,
    TopContentResponse,
    PlatformPerformanceResponse,
    SummaryResponse,
    ChartResponse,
    PlatformComparisonResponse
)

from app.services.analytics_service import (
    get_engagement_data,
    compare_content,
    get_top_performing_content,
    get_reach_analysis,
    get_performance_trends,
    get_top_content,
    get_platform_performance,
    get_dashboard_summary,
    get_engagement_chart,
    get_follower_chart,
    get_platform_comparison
)


router = APIRouter(
    prefix="/analytics",
    tags=["Analytics"]
)


# --------------------------------------------------
# CONTENT ENGAGEMENT
# --------------------------------------------------

@router.get(
    "/content/{content_id}/engagement",
    response_model=EngagementResponse
)
def get_content_engagement(
    content_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    creator_id = current_user.id

    engagement_data = get_engagement_data(
        db=db,
        content_id=content_id,
        creator_id=creator_id
    )

    if not engagement_data:
        raise HTTPException(
            status_code=404,
            detail="Content not found"
        )

    return engagement_data


# --------------------------------------------------
# CONTENT COMPARISON
# --------------------------------------------------

@router.get(
    "/content/comparison",
    response_model=list[ContentComparisonResponse]
)
def get_content_comparison(
    content_ids: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    creator_id = current_user.id

    try:
        ids = [
            int(content_id.strip())
            for content_id in content_ids.split(",")
        ]
    except ValueError:
        raise HTTPException(
            status_code=400,
            detail="content_ids must contain comma-separated integers"
        )

    if not ids:
        raise HTTPException(
            status_code=400,
            detail="At least one content ID is required"
        )

    comparison_data = compare_content(
        db=db,
        content_ids=ids,
        creator_id=creator_id
    )

    if not comparison_data:
        raise HTTPException(
            status_code=404,
            detail="No content found"
        )

    return comparison_data


# --------------------------------------------------
# TOP PERFORMING CONTENT
# --------------------------------------------------

@router.get(
    "/content/top-performing",
    response_model=list[TopPerformingContentResponse]
)
def get_top_performing_content_api(
    limit: int = 5,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    creator_id = current_user.id

    return get_top_performing_content(
        db=db,
        creator_id=creator_id,
        limit=limit
    )


# --------------------------------------------------
# REACH ANALYSIS
# --------------------------------------------------

@router.get(
    "/content/reach",
    response_model=list[ReachAnalysisResponse]
)
def get_reach_analysis_api(
    limit: int = 5,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    creator_id = current_user.id

    return get_reach_analysis(
        db=db,
        creator_id=creator_id,
        limit=limit
    )


# --------------------------------------------------
# PERFORMANCE TRENDS
# --------------------------------------------------

@router.get(
    "/content/performance-trends",
    response_model=list[PerformanceTrendsResponse]
)
def get_performance_trends_api(
    limit: int = 10,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    creator_id = current_user.id

    return get_performance_trends(
        db=db,
        creator_id=creator_id,
        limit=limit
    )


# --------------------------------------------------
# TOP CONTENT
# --------------------------------------------------

@router.get(
    "/top-content",
    response_model=list[TopContentResponse]
)
def get_top_content_api(
    limit: int = 5,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    creator_id = current_user.id

    return get_top_content(
        db=db,
        creator_id=creator_id,
        limit=limit
    )


# --------------------------------------------------
# PLATFORM PERFORMANCE
# --------------------------------------------------

@router.get(
    "/platform-performance",
    response_model=list[PlatformPerformanceResponse]
)
def get_platform_performance_api(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    creator_id = current_user.id

    return get_platform_performance(
        db=db,
        creator_id=creator_id
    )


# --------------------------------------------------
# DASHBOARD SUMMARY
# --------------------------------------------------

@router.get(
    "/summary",
    response_model=SummaryResponse
)
def get_dashboard_summary_api(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    creator_id = current_user.id

    return get_dashboard_summary(
        db=db,
        creator_id=creator_id
    )


# --------------------------------------------------
# ENGAGEMENT CHART
# --------------------------------------------------

@router.get(
    "/chart/engagement",
    response_model=ChartResponse
)
def get_engagement_chart_api(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    creator_id = current_user.id

    return get_engagement_chart(
        db=db,
        creator_id=creator_id
    )


# --------------------------------------------------
# FOLLOWER CHART
# --------------------------------------------------

@router.get(
    "/chart/followers",
    response_model=ChartResponse
)
def get_follower_chart_api(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    creator_id = current_user.id

    return get_follower_chart(
        db=db,
        creator_id=creator_id
    )


# --------------------------------------------------
# PLATFORM COMPARISON
# --------------------------------------------------

@router.get(
    "/platform-comparison",
    response_model=list[PlatformComparisonResponse]
)
def get_platform_comparison_api(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    creator_id = current_user.id

    return get_platform_comparison(
        db=db,
        creator_id=creator_id
    )

