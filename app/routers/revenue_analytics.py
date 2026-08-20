from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.core.auth import get_current_user

from app.schemas.revenue_analytics import (
    RevenueSummaryResponse,
    RevenueBySourceResponse,
    MonthlyRevenueResponse,
    RevenueTrendResponse
)

from app.services.revenue_service import get_creator_by_email

from app.services.revenue_analytics_service import (
    get_total_revenue,
    get_revenue_by_source,
    get_monthly_revenue,
    get_revenue_trends
)


router = APIRouter(
    prefix="/analytics/revenue",
    tags=["Revenue Analytics"]
)


@router.get(
    "/summary",
    response_model=RevenueSummaryResponse
)
def get_revenue_summary_api(
    db: Session = Depends(get_db),
    current_user: str = Depends(get_current_user)
):
    user = get_creator_by_email(db, current_user)

    if not user:
        from fastapi import HTTPException
        raise HTTPException(
            status_code=404,
            detail="Creator not found"
        )

    total_revenue = get_total_revenue(
        db,
        user.id
    )

    return {
        "total_revenue": total_revenue
    }


@router.get(
    "/by-source",
    response_model=list[RevenueBySourceResponse]
)
def get_revenue_by_source_api(
    db: Session = Depends(get_db),
    current_user: str = Depends(get_current_user)
):
    user = get_creator_by_email(db, current_user)

    if not user:
        from fastapi import HTTPException
        raise HTTPException(
            status_code=404,
            detail="Creator not found"
        )

    return get_revenue_by_source(
        db,
        user.id
    )


@router.get(
    "/monthly",
    response_model=list[MonthlyRevenueResponse]
)
def get_monthly_revenue_api(
    db: Session = Depends(get_db),
    current_user: str = Depends(get_current_user)
):
    user = get_creator_by_email(db, current_user)

    if not user:
        from fastapi import HTTPException
        raise HTTPException(
            status_code=404,
            detail="Creator not found"
        )

    return get_monthly_revenue(
        db,
        user.id
    )


@router.get(
    "/trends",
    response_model=list[RevenueTrendResponse]
)
def get_revenue_trends_api(
    db: Session = Depends(get_db),
    current_user: str = Depends(get_current_user)
):
    user = get_creator_by_email(db, current_user)

    if not user:
        from fastapi import HTTPException
        raise HTTPException(
            status_code=404,
            detail="Creator not found"
        )

    return get_revenue_trends(
        db,
        user.id
    )