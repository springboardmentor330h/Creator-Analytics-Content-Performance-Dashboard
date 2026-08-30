from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    Query,
    status,
)

from sqlalchemy.orm import Session

from app.core.auth import get_current_user
from app.db.database import get_db

from app.models.revenue import Revenue
from app.models.user import User

from app.schemas.revenue import (
    RevenueCreate,
    RevenueUpdate,
    RevenueResponse,
    RevenueSummary,
    MonthlyRevenue,
    RevenueTrendPoint,
)

from app.services import revenue_service


router = APIRouter(
    prefix="/revenue",
    tags=["Revenue"],
)


# ============================================================
# ROLE HELPERS
# ============================================================

def is_admin(
    current_user: User,
) -> bool:
    return current_user.role == "Administrator"


def is_creator(
    current_user: User,
) -> bool:
    return current_user.role == "Creator"


# ============================================================
# CREATE REVENUE
# POST /revenue
# ============================================================

@router.post(
    "",
    response_model=RevenueResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_revenue(
    revenue_data: RevenueCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Only creators can create revenue.

    creator_id is always taken from the authenticated user.
    """

    if not is_creator(current_user):

        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=(
                "Only creators can create revenue records."
            ),
        )

    new_revenue = Revenue(
        creator_id=current_user.id,
        source=(
            revenue_data.source.value
            if hasattr(
                revenue_data.source,
                "value",
            )
            else revenue_data.source
        ),
        amount=revenue_data.amount,
        currency=revenue_data.currency,
        description=revenue_data.description,
        date=revenue_data.date,
    )

    db.add(new_revenue)

    db.commit()

    db.refresh(new_revenue)

    return new_revenue


# ============================================================
# GET ALL REVENUE
# GET /revenue
# ============================================================

@router.get(
    "",
    response_model=list[RevenueResponse],
)
def get_all_revenue(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Creator:
        Own revenue only.

    Administrator:
        All creators' revenue.
    """

    query = db.query(Revenue)

    if not is_admin(current_user):

        query = query.filter(
            Revenue.creator_id == current_user.id
        )

    revenues = (
        query
        .order_by(
            Revenue.date.desc(),
            Revenue.id.desc(),
        )
        .all()
    )

    return revenues


# ============================================================
# REVENUE ANALYTICS SUMMARY
# GET /revenue/analytics/summary
# ============================================================

@router.get(
    "/analytics/summary",
    response_model=RevenueSummary,
)
def revenue_summary(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Creator:
        Revenue summary for themselves.

    Administrator:
        Revenue summary across all creators.
    """

    creator_id = (
        None
        if is_admin(current_user)
        else current_user.id
    )

    return revenue_service.get_revenue_summary(
        db,
        creator_id,
    )


# ============================================================
# MONTHLY REVENUE
# GET /revenue/analytics/monthly
# ============================================================

@router.get(
    "/analytics/monthly",
    response_model=list[MonthlyRevenue],
)
def monthly_revenue(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Creator:
        Monthly revenue for themselves.

    Administrator:
        Monthly revenue across all creators.
    """

    creator_id = (
        None
        if is_admin(current_user)
        else current_user.id
    )

    return revenue_service.get_monthly_revenue(
        db,
        creator_id,
    )


# ============================================================
# REVENUE TREND
# GET /revenue/analytics/trend
# ============================================================

@router.get(
    "/analytics/trend",
)
def revenue_trend(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Creator:
        Own revenue trend.

    Administrator:
        Revenue trend across all creators.
    """

    creator_id = (
        None
        if is_admin(current_user)
        else current_user.id
    )

    return revenue_service.get_revenue_trend(
        db,
        creator_id,
    )


# ============================================================
# GET REVENUE BY ID
# GET /revenue/{revenue_id}
# ============================================================

@router.get(
    "/{revenue_id}",
    response_model=RevenueResponse,
)
def get_revenue(
    revenue_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Administrator:
        Can view any revenue record.

    Creator:
        Can view only their own revenue record.
    """

    query = (
        db.query(Revenue)
        .filter(
            Revenue.id == revenue_id
        )
    )

    if not is_admin(current_user):

        query = query.filter(
            Revenue.creator_id == current_user.id
        )

    revenue = query.first()

    if not revenue:

        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Revenue record not found",
        )

    return revenue


# ============================================================
# UPDATE REVENUE
# PUT /revenue/{revenue_id}
# ============================================================

@router.put(
    "/{revenue_id}",
    response_model=RevenueResponse,
)
def update_revenue(
    revenue_id: int,
    revenue_data: RevenueUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Only the creator who owns the record can update it.

    Administrator is read-only.
    """

    if is_admin(current_user):

        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=(
                "Administrators can view revenue "
                "but cannot modify creator revenue."
            ),
        )

    if not is_creator(current_user):

        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=(
                "Only creators can update revenue."
            ),
        )

    revenue = (
        db.query(Revenue)
        .filter(
            Revenue.id == revenue_id,
            Revenue.creator_id == current_user.id,
        )
        .first()
    )

    if not revenue:

        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Revenue record not found",
        )

    update_data = revenue_data.model_dump(
        exclude_unset=True
    )

    # Never allow ownership to change.
    update_data.pop(
        "creator_id",
        None,
    )

    if (
        "source" in update_data
        and update_data["source"] is not None
    ):

        value = update_data["source"]

        update_data["source"] = (
            value.value
            if hasattr(value, "value")
            else value
        )

    for field, value in update_data.items():

        setattr(
            revenue,
            field,
            value,
        )

    db.commit()

    db.refresh(revenue)

    return revenue


# ============================================================
# DELETE REVENUE
# DELETE /revenue/{revenue_id}
# ============================================================

@router.delete(
    "/{revenue_id}",
)
def delete_revenue(
    revenue_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Only the creator who owns the record can delete it.

    Administrator is read-only.
    """

    if is_admin(current_user):

        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=(
                "Administrators can view revenue "
                "but cannot delete creator revenue."
            ),
        )

    if not is_creator(current_user):

        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=(
                "Only creators can delete revenue."
            ),
        )

    revenue = (
        db.query(Revenue)
        .filter(
            Revenue.id == revenue_id,
            Revenue.creator_id == current_user.id,
        )
        .first()
    )

    if not revenue:

        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Revenue record not found",
        )

    db.delete(revenue)

    db.commit()

    return {
        "message": "Revenue deleted successfully",
        "revenue_id": revenue_id,
    }