from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.core.auth import get_current_user
from app.models.user import User, UserRole

from app.schemas.revenue import (
    RevenueCreate,
    RevenueUpdate,
    RevenueResponse
)

from app.schemas.sponsorship import (
    SponsorshipCreate,
    SponsorshipUpdate,
    SponsorshipResponse
)

from app.services.revenue_service import (
    create_revenue,
    get_creator_revenues,
    get_revenue_by_id,
    update_revenue,
    delete_revenue
)

from app.services.sponsorship_service import (
    create_sponsorship,
    get_creator_sponsorships,
    get_sponsorship_by_id,
    update_sponsorship,
    delete_sponsorship
)

from app.services.revenue_analytics_service import (
    get_total_revenue,
    get_revenue_by_source,
    get_monthly_revenue,
    get_revenue_trend
)


router = APIRouter(
    prefix="/revenue",
    tags=["Revenue"]
)


# =========================================================
# CREATOR ACCESS CHECK
# =========================================================

def check_creator(user: User):
    if user.role != UserRole.CREATOR:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only creators can manage revenue and sponsorship data"
        )


# =========================================================
# REVENUE ANALYTICS
# IMPORTANT:
# These routes MUST come before /{revenue_id}
# =========================================================

@router.get("/analytics/total")
def total_revenue(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    check_creator(current_user)

    return {
        "creator_id": current_user.id,
        "total_revenue": get_total_revenue(
            db,
            current_user.id
        )
    }


@router.get("/analytics/by-source")
def revenue_by_source(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    check_creator(current_user)

    return {
        "creator_id": current_user.id,
        "revenue_by_source": get_revenue_by_source(
            db,
            current_user.id
        )
    }


@router.get("/analytics/monthly")
def monthly_revenue(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    check_creator(current_user)

    return {
        "creator_id": current_user.id,
        "monthly_revenue": get_monthly_revenue(
            db,
            current_user.id
        )
    }


@router.get("/analytics/trend")
def revenue_trend(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    check_creator(current_user)

    return {
        "creator_id": current_user.id,
        "revenue_trend": get_revenue_trend(
            db,
            current_user.id
        )
    }


# =========================================================
# SPONSORSHIP ROUTES
# =========================================================

@router.post(
    "/sponsorships",
    response_model=SponsorshipResponse
)
def add_sponsorship(
    data: SponsorshipCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    check_creator(current_user)

    return create_sponsorship(
        db,
        current_user.id,
        data
    )


@router.get(
    "/sponsorships",
    response_model=list[SponsorshipResponse]
)
def list_sponsorships(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    check_creator(current_user)

    return get_creator_sponsorships(
        db,
        current_user.id
    )


@router.get(
    "/sponsorships/{sponsorship_id}",
    response_model=SponsorshipResponse
)
def get_sponsorship(
    sponsorship_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    check_creator(current_user)

    sponsorship = get_sponsorship_by_id(
        db,
        sponsorship_id,
        current_user.id
    )

    if not sponsorship:
        raise HTTPException(
            status_code=404,
            detail="Sponsorship not found"
        )

    return sponsorship


@router.put(
    "/sponsorships/{sponsorship_id}",
    response_model=SponsorshipResponse
)
def edit_sponsorship(
    sponsorship_id: int,
    data: SponsorshipUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    check_creator(current_user)

    sponsorship = get_sponsorship_by_id(
        db,
        sponsorship_id,
        current_user.id
    )

    if not sponsorship:
        raise HTTPException(
            status_code=404,
            detail="Sponsorship not found"
        )

    return update_sponsorship(
        db,
        sponsorship,
        data
    )


@router.delete(
    "/sponsorships/{sponsorship_id}"
)
def remove_sponsorship(
    sponsorship_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    check_creator(current_user)

    sponsorship = get_sponsorship_by_id(
        db,
        sponsorship_id,
        current_user.id
    )

    if not sponsorship:
        raise HTTPException(
            status_code=404,
            detail="Sponsorship not found"
        )

    delete_sponsorship(
        db,
        sponsorship
    )

    return {
        "message": "Sponsorship deleted successfully"
    }


# =========================================================
# REVENUE CRUD ROUTES
# =========================================================

@router.post(
    "/",
    response_model=RevenueResponse
)
def add_revenue(
    data: RevenueCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    check_creator(current_user)

    return create_revenue(
        db,
        current_user.id,
        data
    )


@router.get(
    "/",
    response_model=list[RevenueResponse]
)
def list_revenues(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    check_creator(current_user)

    return get_creator_revenues(
        db,
        current_user.id
    )


@router.get(
    "/{revenue_id}",
    response_model=RevenueResponse
)
def get_revenue(
    revenue_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    check_creator(current_user)

    revenue = get_revenue_by_id(
        db,
        revenue_id,
        current_user.id
    )

    if not revenue:
        raise HTTPException(
            status_code=404,
            detail="Revenue not found"
        )

    return revenue


@router.put(
    "/{revenue_id}",
    response_model=RevenueResponse
)
def edit_revenue(
    revenue_id: int,
    data: RevenueUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    check_creator(current_user)

    revenue = get_revenue_by_id(
        db,
        revenue_id,
        current_user.id
    )

    if not revenue:
        raise HTTPException(
            status_code=404,
            detail="Revenue not found"
        )

    return update_revenue(
        db,
        revenue,
        data
    )


@router.delete(
    "/{revenue_id}"
)
def remove_revenue(
    revenue_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    check_creator(current_user)

    revenue = get_revenue_by_id(
        db,
        revenue_id,
        current_user.id
    )

    if not revenue:
        raise HTTPException(
            status_code=404,
            detail="Revenue not found"
        )

    delete_revenue(
        db,
        revenue
    )

    return {
        "message": "Revenue deleted successfully"
    }