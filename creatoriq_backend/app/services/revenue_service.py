from sqlalchemy import func
from sqlalchemy.orm import Session

from app.models.revenue import Revenue


def get_total_revenue(db: Session, creator_id: int) -> float:
    """
    Sum of all revenue amounts for a creator.
    """

    total = (
        db.query(func.coalesce(func.sum(Revenue.amount), 0.0))
        .filter(Revenue.creator_id == creator_id)
        .scalar()
    )

    return round(float(total), 2)


def get_revenue_by_source(db: Session, creator_id: int) -> list[dict]:
    """
    Total revenue grouped by source (sponsorship, ad_revenue, etc.)
    """

    rows = (
        db.query(
            Revenue.source,
            func.coalesce(func.sum(Revenue.amount), 0.0).label("total_amount"),
        )
        .filter(Revenue.creator_id == creator_id)
        .group_by(Revenue.source)
        .order_by(func.sum(Revenue.amount).desc())
        .all()
    )

    return [
        {"source": row.source, "total_amount": round(float(row.total_amount), 2)}
        for row in rows
    ]


def get_monthly_revenue(db: Session, creator_id: int) -> list[dict]:
    """
    Total revenue grouped by calendar month (YYYY-MM), oldest first.

    Grouping is done in Python (rather than with a database-specific
    date-formatting function like Postgres' to_char) so this works
    identically across database backends.
    """

    rows = (
        db.query(Revenue.date, Revenue.amount)
        .filter(Revenue.creator_id == creator_id)
        .order_by(Revenue.date.asc())
        .all()
    )

    monthly_totals: dict[str, float] = {}

    for row in rows:
        month_key = row.date.strftime("%Y-%m")
        monthly_totals[month_key] = monthly_totals.get(month_key, 0.0) + float(row.amount)

    return [
        {"month": month, "total_amount": round(total, 2)}
        for month, total in sorted(monthly_totals.items())
    ]


def get_revenue_trend(db: Session, creator_id: int) -> dict:
    """
    Chart-ready revenue trend: {labels: [...], values: [...]}
    built from the same monthly aggregation used above.
    """

    monthly = get_monthly_revenue(db, creator_id)

    return {
        "labels": [row["month"] for row in monthly],
        "values": [row["total_amount"] for row in monthly],
    }


def get_revenue_summary(db: Session, creator_id: int) -> dict:
    """
    Combined revenue summary: total revenue, record count,
    and the revenue-by-source breakdown.
    """

    total_records = (
        db.query(func.count(Revenue.id))
        .filter(Revenue.creator_id == creator_id)
        .scalar()
    )

    return {
        "total_revenue": get_total_revenue(db, creator_id),
        "total_records": int(total_records),
        "revenue_by_source": get_revenue_by_source(db, creator_id),
    }