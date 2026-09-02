from sqlalchemy.orm import Session
from sqlalchemy import func, extract

from app.models.revenue import Revenue


# =========================================================
# TOTAL REVENUE
# =========================================================

def get_total_revenue(db: Session, creator_id: int):
    total = (
        db.query(func.coalesce(func.sum(Revenue.amount), 0))
        .filter(Revenue.creator_id == creator_id)
        .scalar()
    )

    return float(total)


# =========================================================
# REVENUE BY SOURCE
# =========================================================

def get_revenue_by_source(db: Session, creator_id: int):
    results = (
        db.query(
            Revenue.source,
            func.sum(Revenue.amount).label("total_amount")
        )
        .filter(Revenue.creator_id == creator_id)
        .group_by(Revenue.source)
        .all()
    )

    return [
        {
            "source": source,
            "total_amount": float(total_amount)
        }
        for source, total_amount in results
    ]


# =========================================================
# MONTHLY REVENUE
# =========================================================

def get_monthly_revenue(db: Session, creator_id: int):
    results = (
        db.query(
            extract("year", Revenue.revenue_date).label("year"),
            extract("month", Revenue.revenue_date).label("month"),
            func.sum(Revenue.amount).label("total_amount")
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
            "year": int(year),
            "month": int(month),
            "total_amount": float(total_amount)
        }
        for year, month, total_amount in results
    ]


# =========================================================
# REVENUE TREND
# =========================================================

def get_revenue_trend(db: Session, creator_id: int):
    results = (
        db.query(
            Revenue.revenue_date,
            func.sum(Revenue.amount).label("total_amount")
        )
        .filter(Revenue.creator_id == creator_id)
        .group_by(Revenue.revenue_date)
        .order_by(Revenue.revenue_date)
        .all()
    )

    return [
        {
            "date": revenue_date,
            "total_amount": float(total_amount)
        }
        for revenue_date, total_amount in results
    ]