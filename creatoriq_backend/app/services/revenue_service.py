from collections import defaultdict
from decimal import Decimal

from sqlalchemy import func
from sqlalchemy.orm import Session

from app.models.revenue import Revenue
from app.schemas.revenue import RevenueCreate, RevenueUpdate


# -------------------------
# Revenue CRUD
# -------------------------

def create_revenue(
    db: Session,
    revenue_data: RevenueCreate,
):
    revenue = Revenue(
        creator_id=revenue_data.creator_id,
        source=revenue_data.source,
        amount=revenue_data.amount,
        revenue_date=revenue_data.revenue_date,
        description=revenue_data.description,
    )

    db.add(revenue)
    db.commit()
    db.refresh(revenue)

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

    for field, value in update_data.items():
        setattr(revenue, field, value)

    db.commit()
    db.refresh(revenue)

    return revenue


def delete_revenue(
    db: Session,
    revenue: Revenue,
):
    db.delete(revenue)
    db.commit()


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