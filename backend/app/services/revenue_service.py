from collections import defaultdict
from sqlalchemy.orm import Session
from app.models.revenue import RevenueRecord
from app.models.sponsorship import Sponsorship


def get_revenue_summary(db: Session, creator_id: int) -> dict:
    records = db.query(RevenueRecord).filter(RevenueRecord.creator_id == creator_id).all()
    total = sum(r.amount for r in records)

    by_source = defaultdict(float)
    by_platform = defaultdict(float)
    for r in records:
        by_source[r.source] += r.amount
        by_platform[r.platform] += r.amount

    return {
        "total_earnings": round(total, 2),
        "by_source": {k: round(v, 2) for k, v in by_source.items()},
        "by_platform": {k: round(v, 2) for k, v in by_platform.items()},
        "record_count": len(records),
    }


def get_monthly_revenue(db: Session, creator_id: int) -> list[dict]:
    records = (
        db.query(RevenueRecord)
        .filter(RevenueRecord.creator_id == creator_id)
        .order_by(RevenueRecord.earned_date.asc())
        .all()
    )
    monthly = defaultdict(float)
    for r in records:
        key = r.earned_date.strftime("%Y-%m")
        monthly[key] += r.amount

    return [{"month": k, "total_revenue": round(v, 2)} for k, v in sorted(monthly.items())]


def get_revenue_trend(db: Session, creator_id: int) -> dict:
    monthly = get_monthly_revenue(db, creator_id)
    if len(monthly) < 2:
        return {"trend": "stable", "monthly_data": monthly}

    half = len(monthly) // 2 or 1
    first_avg = sum(m["total_revenue"] for m in monthly[:half]) / half
    second_avg = sum(m["total_revenue"] for m in monthly[half:]) / max(len(monthly) - half, 1)

    if second_avg > first_avg * 1.1:
        direction = "up"
    elif second_avg < first_avg * 0.9:
        direction = "down"
    else:
        direction = "stable"

    return {"trend": direction, "monthly_data": monthly}


def get_sponsorship_summary(db: Session, creator_id: int) -> dict:
    sponsorships = db.query(Sponsorship).filter(Sponsorship.creator_id == creator_id).all()
    total_value = sum(s.contract_value for s in sponsorships)
    active = [s for s in sponsorships if s.status == "active"]
    pending_payment = [s for s in sponsorships if s.payment_status == "pending"]

    return {
        "total_sponsorships": len(sponsorships),
        "total_contract_value": round(total_value, 2),
        "active_sponsorships": len(active),
        "pending_payments": len(pending_payment),
    }