from typing import List

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.models.revenue import Revenue
from app.models.sponsorship import Sponsorship

from app.schemas.revenue import (
    MonthlyRevenue,
    RevenueBySource,
    RevenueCreate,
    RevenueResponse,
    RevenueTrend,
    RevenueUpdate,
)

from app.schemas.sponsorship import (
    SponsorshipCreate,
    SponsorshipResponse,
    SponsorshipUpdate,
)

from app.services.revenue_service import (
    monthly_revenue,
    revenue_by_source,
    revenue_trend,
    summary,
)


router = APIRouter(
    prefix="/revenue",
    tags=["Revenue"],
)


# ============================================================
# REVENUE ANALYTICS
# ============================================================

@router.get("/analytics/summary")
def revenue_summary(
    creator_id: int = Query(..., ge=1),
    db: Session = Depends(get_db),
):
    return summary(db, creator_id)


@router.get("/analytics/by-source", response_model=List[RevenueBySource])
def revenue_source_analytics(
    creator_id: int = Query(..., ge=1),
    db: Session = Depends(get_db),
):
    return revenue_by_source(db, creator_id)


@router.get("/analytics/monthly", response_model=List[MonthlyRevenue])
def revenue_monthly_analytics(
    creator_id: int = Query(..., ge=1),
    db: Session = Depends(get_db),
):
    return monthly_revenue(db, creator_id)


@router.get("/analytics/trend")
def revenue_trend_analytics(
    creator_id: int = Query(..., ge=1),
    db: Session = Depends(get_db),
):
    return revenue_trend(db, creator_id)


# ============================================================
# REVENUE CRUD
# ============================================================

@router.post(
    "",
    response_model=RevenueResponse,
    status_code=201,
)
def create_revenue(
    data: RevenueCreate,
    db: Session = Depends(get_db),
):
    revenue = Revenue(**data.model_dump())

    db.add(revenue)
    db.commit()
    db.refresh(revenue)

    return revenue


@router.get(
    "",
    response_model=List[RevenueResponse],
)
def get_revenue(
    creator_id: int = Query(..., ge=1),
    db: Session = Depends(get_db),
):
    return (
        db.query(Revenue)
        .filter(Revenue.creator_id == creator_id)
        .order_by(Revenue.received_date.desc(), Revenue.id.desc())
        .all()
    )


@router.get(
    "/{revenue_id}",
    response_model=RevenueResponse,
)
def get_revenue_by_id(
    revenue_id: int,
    creator_id: int = Query(..., ge=1),
    db: Session = Depends(get_db),
):
    revenue = (
        db.query(Revenue)
        .filter(
            Revenue.id == revenue_id,
            Revenue.creator_id == creator_id,
        )
        .first()
    )

    if not revenue:
        raise HTTPException(
            status_code=404,
            detail="Revenue not found for this creator",
        )

    return revenue


@router.put(
    "/{revenue_id}",
    response_model=RevenueResponse,
)
def update_revenue(
    revenue_id: int,
    data: RevenueUpdate,
    creator_id: int = Query(..., ge=1),
    db: Session = Depends(get_db),
):
    revenue = (
        db.query(Revenue)
        .filter(
            Revenue.id == revenue_id,
            Revenue.creator_id == creator_id,
        )
        .first()
    )

    if not revenue:
        raise HTTPException(
            status_code=404,
            detail="Revenue not found for this creator",
        )

    updates = data.model_dump(exclude_unset=True)

    for key, value in updates.items():
        setattr(revenue, key, value)

    db.commit()
    db.refresh(revenue)

    return revenue


@router.delete("/{revenue_id}")
def delete_revenue(
    revenue_id: int,
    creator_id: int = Query(..., ge=1),
    db: Session = Depends(get_db),
):
    revenue = (
        db.query(Revenue)
        .filter(
            Revenue.id == revenue_id,
            Revenue.creator_id == creator_id,
        )
        .first()
    )

    if not revenue:
        raise HTTPException(
            status_code=404,
            detail="Revenue not found for this creator",
        )

    db.delete(revenue)
    db.commit()

    return {
        "message": "Revenue deleted successfully",
        "revenue_id": revenue_id,
    }


# ============================================================
# SPONSORSHIP CRUD
# ============================================================

@router.post(
    "/sponsorships",
    response_model=SponsorshipResponse,
    status_code=201,
)
def create_sponsorship(
    data: SponsorshipCreate,
    db: Session = Depends(get_db),
):
    sponsorship = Sponsorship(**data.model_dump())

    db.add(sponsorship)
    db.commit()
    db.refresh(sponsorship)

    return sponsorship


@router.get(
    "/sponsorships",
    response_model=List[SponsorshipResponse],
)
def get_sponsorships(
    creator_id: int = Query(..., ge=1),
    db: Session = Depends(get_db),
):
    return (
        db.query(Sponsorship)
        .filter(Sponsorship.creator_id == creator_id)
        .order_by(Sponsorship.start_date.desc(), Sponsorship.id.desc())
        .all()
    )


@router.get(
    "/sponsorships/{sponsorship_id}",
    response_model=SponsorshipResponse,
)
def get_sponsorship(
    sponsorship_id: int,
    creator_id: int = Query(..., ge=1),
    db: Session = Depends(get_db),
):
    sponsorship = (
        db.query(Sponsorship)
        .filter(
            Sponsorship.id == sponsorship_id,
            Sponsorship.creator_id == creator_id,
        )
        .first()
    )

    if not sponsorship:
        raise HTTPException(
            status_code=404,
            detail="Sponsorship not found for this creator",
        )

    return sponsorship


@router.put(
    "/sponsorships/{sponsorship_id}",
    response_model=SponsorshipResponse,
)
def update_sponsorship(
    sponsorship_id: int,
    data: SponsorshipUpdate,
    creator_id: int = Query(..., ge=1),
    db: Session = Depends(get_db),
):
    sponsorship = (
        db.query(Sponsorship)
        .filter(
            Sponsorship.id == sponsorship_id,
            Sponsorship.creator_id == creator_id,
        )
        .first()
    )

    if not sponsorship:
        raise HTTPException(
            status_code=404,
            detail="Sponsorship not found for this creator",
        )

    updates = data.model_dump(exclude_unset=True)

    for key, value in updates.items():
        setattr(sponsorship, key, value)

    db.commit()
    db.refresh(sponsorship)

    return sponsorship


@router.delete("/sponsorships/{sponsorship_id}")
def delete_sponsorship(
    sponsorship_id: int,
    creator_id: int = Query(..., ge=1),
    db: Session = Depends(get_db),
):
    sponsorship = (
        db.query(Sponsorship)
        .filter(
            Sponsorship.id == sponsorship_id,
            Sponsorship.creator_id == creator_id,
        )
        .first()
    )

    if not sponsorship:
        raise HTTPException(
            status_code=404,
            detail="Sponsorship not found for this creator",
        )

    db.delete(sponsorship)
    db.commit()

    return {
        "message": "Sponsorship deleted successfully",
        "sponsorship_id": sponsorship_id,
    }
