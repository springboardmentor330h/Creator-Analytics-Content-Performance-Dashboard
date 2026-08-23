from sqlalchemy.orm import Session
from collections import defaultdict

from app.models.revenue import Revenue


def get_total_revenue(db: Session, creator_id: int) -> float:
    records = db.query(Revenue).filter(Revenue.creator_id == creator_id).all()
    return round(sum(r.amount for r in records), 2)


def get_revenue_by_source(db: Session, creator_id: int) -> dict:
    records = db.query(Revenue).filter(Revenue.creator_id == creator_id).all()
    totals = defaultdict(float)
    for r in records:
        totals[r.source] += r.amount
    return {source: round(amount, 2) for source, amount in totals.items()}


def get_monthly_revenue(db: Session, creator_id: int) -> list:
    records = db.query(Revenue).filter(Revenue.creator_id == creator_id).order_by(Revenue.date.asc()).all()
    totals = defaultdict(float)
    for r in records:
        month_key = r.date.strftime("%Y-%m")
        totals[month_key] += r.amount

    sorted_months = sorted(totals.keys())
    return [{"month": m, "total_revenue": round(totals[m], 2)} for m in sorted_months]


def get_revenue_trend(db: Session, creator_id: int) -> dict:
    monthly_data = get_monthly_revenue(db, creator_id)
    labels = [m["month"] for m in monthly_data]
    values = [m["total_revenue"] for m in monthly_data]
    return {"labels": labels, "values": values}


def get_revenue_summary(db: Session, creator_id: int) -> dict:
    return {
        "total_revenue": get_total_revenue(db, creator_id),
        "revenue_by_source": get_revenue_by_source(db, creator_id),
        "monthly_revenue": get_monthly_revenue(db, creator_id)
    }