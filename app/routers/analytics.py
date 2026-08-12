from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.database import get_db

from app.schemas.analytics import (
    EngagementResponse,
    ContentComparisonResponse,
    TopPerformingContentResponse,
    ReachAnalysisResponse,
    PerformanceTrendsResponse,
    TopContentResponse,
    PlatformPerformanceResponse,
    SummaryResponse
)

from app.services.analytics_service import (
    get_engagement_data,
    compare_content,
    get_top_performing_content,
    get_reach_analysis,
    get_performance_trends,
    get_top_content,
    get_platform_performance,
    get_dashboard_summary
)


router = APIRouter(
    prefix="/analytics",
    tags=["Analytics"]
)


@router.get(
    "/content/{content_id}/engagement",
    response_model=EngagementResponse
)
def get_content_engagement(
    content_id: int,
    db: Session = Depends(get_db)
):
    engagement_data = get_engagement_data(
        db=db,
        content_id=content_id
    )

    if not engagement_data:
        raise HTTPException(
            status_code=404,
            detail="Content not found"
        )

    return engagement_data


@router.get(
    "/content/comparison",
    response_model=list[ContentComparisonResponse]
)
def get_content_comparison(
    content_ids: str,
    db: Session = Depends(get_db)
):
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
        content_ids=ids
    )

    if not comparison_data:
        raise HTTPException(
            status_code=404,
            detail="No content found"
        )

    return comparison_data


@router.get(
    "/content/top-performing",
    response_model=list[TopPerformingContentResponse]
)
def get_top_performing_content_api(
    limit: int = 5,
    db: Session = Depends(get_db)
):
    return get_top_performing_content(
        db=db,
        limit=limit
    )


@router.get(
    "/content/reach",
    response_model=list[ReachAnalysisResponse]
)
def get_reach_analysis_api(
    limit: int = 5,
    db: Session = Depends(get_db)
):
    return get_reach_analysis(
        db=db,
        limit=limit
    )

@router.get(
    "/content/performance-trends",
    response_model=list[PerformanceTrendsResponse]
)
def get_performance_trends_api(
    limit: int = 10,
    db: Session = Depends(get_db)
):
    return get_performance_trends(
        db=db,
        limit=limit
    )


@router.get(
    "/top-content",
    response_model=list[TopContentResponse]
)
def get_top_content_api(
    limit: int = 5,
    db: Session = Depends(get_db)
):
    return get_top_content(
        db=db,
        limit=limit
    )


@router.get(
    "/platform-performance",
    response_model=list[PlatformPerformanceResponse]
)
def get_platform_performance_api(
    db: Session = Depends(get_db)
):
    return get_platform_performance(db=db)


@router.get(
    "/summary",
    response_model=SummaryResponse
)
def get_dashboard_summary_api(
    db: Session = Depends(get_db)
):
    return get_dashboard_summary(db=db)