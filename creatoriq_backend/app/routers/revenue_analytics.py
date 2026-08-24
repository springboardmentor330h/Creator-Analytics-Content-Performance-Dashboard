from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.services.revenue_service import (
    get_revenue_summary,
    get_revenue_by_source,
    get_monthly_revenue,
    get_revenue_trend,
)


router = APIRouter(
    prefix="/revenue/analytics",
    tags=["Revenue Analytics"],
)


@router.get("/summary")
def revenue_summary(
    creator_id: int,
    db: Session = Depends(get_db),
):
    return get_revenue_summary(
        db,
        creator_id,
    )


@router.get("/by-source")
def revenue_by_source(
    creator_id: int,
    db: Session = Depends(get_db),
):
    return get_revenue_by_source(
        db,
        creator_id,
    )


@router.get("/monthly")
def monthly_revenue(
    creator_id: int,
    db: Session = Depends(get_db),
):
    return get_monthly_revenue(
        db,
        creator_id,
    )


@router.get("/trend")
def revenue_trend(
    creator_id: int,
    db: Session = Depends(get_db),
):
    return get_revenue_trend(
        db,
        creator_id,
    )