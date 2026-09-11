from collections import defaultdict
from decimal import Decimal

from sqlalchemy import func
from sqlalchemy.orm import Session

from app.models.revenue import Revenue
from app.models.sponsorship import Sponsorship
from app.schemas.revenue import RevenueCreate, RevenueUpdate

# -------------------------
# Revenue CRUD
# -------------------------

def validate_sponsorship(
    db: Session,
    creator_id: int,
    sponsorship_id: int | None,
):
    if sponsorship_id is None:
        return None

    sponsorship = (
        db.query(Sponsorship)
        .filter(
            Sponsorship.id == sponsorship_id,
            Sponsorship.creator_id == creator_id,
        )
        .first()
    )

    if sponsorship is None:
        raise ValueError(
            "Sponsorship does not exist or does not belong to this creator"
        )

    return sponsorship


def create_revenue(
    db: Session,
    revenue_data: RevenueCreate,
):
    validate_sponsorship(
        db,
        revenue_data.creator_id,
        revenue_data.sponsorship_id,
    )

    revenue = Revenue(
        creator_id=revenue_data.creator_id,
        sponsorship_id=revenue_data.sponsorship_id,
        source=revenue_data.source,
        amount=revenue_data.amount,
        revenue_date=revenue_data.revenue_date,
        description=revenue_data.description,
    )

    db.add(revenue)

    try:
        db.commit()
        db.refresh(revenue)
    except Exception:
        db.rollback()
        raise

    return revenue


def get_revenues(
    db: Session,
    creator_id: int,
):
    return (
        db.query(Revenue)
        .filter(Revenue.creator_id == creator_id)
        .order_by(Revenue.revenue_date.desc())
        .all()
    )


def get_revenue(
    db: Session,
    revenue_id: int,
    creator_id: int,
):
    return (
        db.query(Revenue)
        .filter(
            Revenue.id == revenue_id,
            Revenue.creator_id == creator_id,
        )
        .first()
    )


def update_revenue(
    db: Session,
    revenue: Revenue,
    revenue_data: RevenueUpdate,
):
    update_data = revenue_data.model_dump(
        exclude_unset=True,
    )

    if "sponsorship_id" in update_data:
        validate_sponsorship(
            db,
            revenue.creator_id,
            update_data["sponsorship_id"],
        )

    for field, value in update_data.items():
        setattr(revenue, field, value)

    try:
        db.commit()
        db.refresh(revenue)
    except Exception:
        db.rollback()
        raise

    return revenue


def delete_revenue(
    db: Session,
    revenue: Revenue,
):
    try:
        db.delete(revenue)
        db.commit()
    except Exception:
        db.rollback()
        raise


# -------------------------
# Revenue Analytics
# -------------------------

def get_revenue_summary(
    db: Session,
    creator_id: int,
):
    total = (
        db.query(
            func.coalesce(
                func.sum(Revenue.amount),
                0,
            )
        )
        .filter(
            Revenue.creator_id == creator_id
        )
        .scalar()
    )

    return {
        "creator_id": creator_id,
        "total_revenue": float(total or 0),
    }


def get_revenue_by_source(
    db: Session,
    creator_id: int,
):
    rows = (
        db.query(
            Revenue.source,
            func.sum(Revenue.amount).label("total"),
        )
        .filter(
            Revenue.creator_id == creator_id
        )
        .group_by(Revenue.source)
        .all()
    )

    return {
        "creator_id": creator_id,
        "revenue_by_source": [
            {
                "source": source,
                "amount": float(total or 0),
            }
            for source, total in rows
        ],
    }


def get_monthly_revenue(
    db: Session,
    creator_id: int,
):
    rows = (
        db.query(
            Revenue.revenue_date,
            Revenue.amount,
        )
        .filter(
            Revenue.creator_id == creator_id
        )
        .order_by(
            Revenue.revenue_date
        )
        .all()
    )

    monthly = defaultdict(Decimal)

    for revenue_date, amount in rows:
        month = revenue_date.strftime("%Y-%m")
        monthly[month] += amount

    return {
        "creator_id": creator_id,
        "monthly_revenue": [
            {
                "month": month,
                "amount": float(amount),
            }
            for month, amount in sorted(
                monthly.items()
            )
        ],
    }


def get_revenue_trend(
    db: Session,
    creator_id: int,
):
    rows = (
        db.query(
            Revenue.revenue_date,
            Revenue.amount,
        )
        .filter(
            Revenue.creator_id == creator_id
        )
        .order_by(
            Revenue.revenue_date
        )
        .all()
    )

    return {
        "creator_id": creator_id,
        "trend": [
            {
                "date": revenue_date.isoformat(),
                "amount": float(amount),
            }
            for revenue_date, amount in rows
        ],
    }