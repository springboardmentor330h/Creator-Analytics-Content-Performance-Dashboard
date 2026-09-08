from sqlalchemy.orm import Session
from sqlalchemy import func, extract

from app.models.revenue import Revenue


# =========================================================
# REVENUE CRUD
# =========================================================

def create_revenue(db: Session, revenue_data):
    revenue = Revenue(**revenue_data.model_dump())

    db.add(revenue)
    db.commit()
    db.refresh(revenue)

    return revenue


def get_all_revenue(db: Session, creator_id: int):
    return (
        db.query(Revenue)
        .filter(Revenue.creator_id == creator_id)
        .all()
    )


def get_revenue_by_id(
    db: Session,
    revenue_id: int,
    creator_id: int
):
    return (
        db.query(Revenue)
        .filter(
            Revenue.id == revenue_id,
            Revenue.creator_id == creator_id
        )
        .first()
    )


def update_revenue(
    db: Session,
    revenue_id: int,
    creator_id: int,
    revenue_data
):
    revenue = get_revenue_by_id(
        db,
        revenue_id,
        creator_id
    )

    if not revenue:
        return None

    update_data = revenue_data.model_dump(
        exclude_unset=True
    )

    for key, value in update_data.items():
        setattr(revenue, key, value)

    db.commit()
    db.refresh(revenue)

    return revenue


def delete_revenue(
    db: Session,
    revenue_id: int,
    creator_id: int
):
    revenue = get_revenue_by_id(
        db,
        revenue_id,
        creator_id
    )

    if not revenue:
        return None

    db.delete(revenue)
    db.commit()

    return revenue


# =========================================================
# REVENUE ANALYTICS
# =========================================================

def get_revenue_summary(db: Session):

    total_revenue = (
        db.query(
            func.coalesce(
                func.sum(Revenue.amount),
                0
            )
        )
        .scalar()
    )

    revenue_count = db.query(Revenue).count()

    return {
        "total_revenue": total_revenue,
        "revenue_count": revenue_count
    }


def get_revenue_by_source(db: Session):

    results = (
        db.query(
            Revenue.source,
            func.sum(Revenue.amount).label(
                "total_amount"
            )
        )
        .group_by(Revenue.source)
        .all()
    )

    return [
        {
            "source": source,
            "total_amount": total_amount
        }
        for source, total_amount in results
    ]


def get_monthly_revenue(db: Session):

    results = (
        db.query(
            extract(
                "year",
                Revenue.earned_date
            ).label("year"),

            extract(
                "month",
                Revenue.earned_date
            ).label("month"),

            func.sum(
                Revenue.amount
            ).label("total_amount")
        )
        .group_by(
            extract("year", Revenue.earned_date),
            extract("month", Revenue.earned_date)
        )
        .order_by(
            extract("year", Revenue.earned_date),
            extract("month", Revenue.earned_date)
        )
        .all()
    )

    return [
        {
            "year": int(year),
            "month": int(month),
            "total_amount": total_amount
        }
        for year, month, total_amount in results
    ]
def get_revenue_dashboard(db: Session):
    total_revenue = db.query(
        func.coalesce(func.sum(Revenue.amount), 0)
    ).scalar()

    total_transactions = db.query(Revenue).count()

    average_revenue = db.query(
        func.coalesce(func.avg(Revenue.amount), 0)
    ).scalar()

    return {
        "total_revenue": total_revenue,
        "total_transactions": total_transactions,
        "average_revenue": average_revenue
    }