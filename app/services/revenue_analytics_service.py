from sqlalchemy.orm import Session
from sqlalchemy import func, extract

from app.models.revenue import Revenue


def get_total_revenue(
    db: Session,
    creator_id: int
):
    result = (
        db.query(func.sum(Revenue.amount))
        .filter(Revenue.creator_id == creator_id)
        .scalar()
    )

    return result or 0


def get_revenue_by_source(
    db: Session,
    creator_id: int
):
    results = (
        db.query(
            Revenue.source,
            func.sum(Revenue.amount).label("total_revenue")
        )
        .filter(Revenue.creator_id == creator_id)
        .group_by(Revenue.source)
        .order_by(func.sum(Revenue.amount).desc())
        .all()
    )

    return [
        {
            "source": row.source,
            "total_revenue": row.total_revenue
        }
        for row in results
    ]


def get_monthly_revenue(
    db: Session,
    creator_id: int
):
    results = (
        db.query(
            extract("year", Revenue.revenue_date).label("year"),
            extract("month", Revenue.revenue_date).label("month"),
            func.sum(Revenue.amount).label("total_revenue")
        )
        .filter(Revenue.creator_id == creator_id)
        .group_by(
            extract("year", Revenue.revenue_date),
            extract("month", Revenue.revenue_date)
        )
        .order_by(
            extract("year", Revenue.revenue_date),
            extract("month", Revenue.revenue_date)
        )
        .all()
    )

    return [
        {
            "year": int(row.year),
            "month": int(row.month),
            "total_revenue": row.total_revenue
        }
        for row in results
    ]


def get_revenue_trends(
    db: Session,
    creator_id: int
):
    results = (
        db.query(
            Revenue.revenue_date,
            func.sum(Revenue.amount).label("total_revenue")
        )
        .filter(Revenue.creator_id == creator_id)
        .group_by(Revenue.revenue_date)
        .order_by(Revenue.revenue_date)
        .all()
    )

    return [
        {
            "date": row.revenue_date,
            "total_revenue": row.total_revenue
        }
        for row in results
    ]