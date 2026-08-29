from typing import Any, Dict, List

from sqlalchemy import func, extract
from sqlalchemy.orm import Session

from app.models.revenue import Revenue


def get_total_revenue(db: Session, creator_id: int) -> float:
    total = (
        db.query(func.coalesce(func.sum(Revenue.amount), 0))
        .filter(Revenue.creator_id == creator_id)
        .scalar()
    )
    return round(float(total), 2)


def get_revenue_by_source(db: Session, creator_id: int) -> Dict[str, float]:
    rows = (
        db.query(Revenue.source, func.coalesce(func.sum(Revenue.amount), 0))
        .filter(Revenue.creator_id == creator_id)
        .group_by(Revenue.source)
        .all()
    )
    return {source: round(float(total), 2) for source, total in rows}


def get_monthly_revenue(db: Session, creator_id: int) -> List[Dict[str, Any]]:
    """Returns revenue totals grouped by year-month, oldest first."""
    rows = (
        db.query(
            extract("year", Revenue.date).label("year"),
            extract("month", Revenue.date).label("month"),
            func.coalesce(func.sum(Revenue.amount), 0).label("total"),
        )
        .filter(Revenue.creator_id == creator_id)
        .group_by("year", "month")
        .order_by("year", "month")
        .all()
    )
    return [
        {"month": f"{int(year):04d}-{int(month):02d}", "total_revenue": round(float(total), 2)}
        for year, month, total in rows
    ]


def get_revenue_trend(db: Session, creator_id: int) -> List[Dict[str, Any]]:
    """
    Same monthly data as get_monthly_revenue, but annotated with
    month-over-month growth.
    """
    monthly = get_monthly_revenue(db, creator_id)

    trend = []
    previous_total = None
    for entry in monthly:
        current_total = entry["total_revenue"]
        if previous_total is None:
            change = 0.0
            change_percentage = 0.0
        else:
            change = round(current_total - previous_total, 2)
            change_percentage = round((change / previous_total) * 100, 2) if previous_total else 0.0

        trend.append({
            "month": entry["month"],
            "total_revenue": current_total,
            "change": change,
            "change_percentage": change_percentage,
        })
        previous_total = current_total

    return trend


def get_revenue_summary(db: Session, creator_id: int) -> Dict[str, Any]:
    """Combined summary report."""
    return {
        "total_revenue": get_total_revenue(db, creator_id),
        "revenue_by_source": get_revenue_by_source(db, creator_id),
        "monthly_revenue": get_monthly_revenue(db, creator_id),
        "revenue_trend": get_revenue_trend(db, creator_id),
    }