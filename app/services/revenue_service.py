from collections import defaultdict

from sqlalchemy.orm import Session

from app.models.revenue import RevenueRecord, Sponsorship


def get_revenue_summary(db: Session, creator_id: int):
    records = db.query(RevenueRecord).filter(RevenueRecord.creator_id == creator_id).all()

    total = sum(r.amount for r in records)

    by_source = defaultdict(float)
    by_platform = defaultdict(float)
    for r in records:
        by_source[r.source] += r.amount
        by_platform[r.platform] += r.amount

    return {
        "creator_id": creator_id,
        "total_revenue": round(total, 2),
        "by_source": {k: round(v, 2) for k, v in by_source.items()},
        "by_platform": {k: round(v, 2) for k, v in by_platform.items()},
        "record_count": len(records),
    }


def get_monthly_breakdown(db: Session, creator_id: int):
    records = db.query(RevenueRecord).filter(RevenueRecord.creator_id == creator_id).all()

    monthly = defaultdict(float)
    for r in records:
        key = r.record_date.strftime("%Y-%m")
        monthly[key] += r.amount

    return [
        {"month": month, "total": round(total, 2)}
        for month, total in sorted(monthly.items())
    ]


def get_revenue_trend(db: Session, creator_id: int):
    """Compares the most recent month against the previous one."""
    breakdown = get_monthly_breakdown(db, creator_id)

    if len(breakdown) < 2:
        return {"trend": "insufficient_data", "monthly": breakdown}

    latest = breakdown[-1]["total"]
    previous = breakdown[-2]["total"]

    change_percent = 0
    if previous > 0:
        change_percent = round(((latest - previous) / previous) * 100, 2)

    direction = "up" if latest > previous else ("down" if latest < previous else "flat")

    return {
        "trend": direction,
        "change_percent": change_percent,
        "latest_month": breakdown[-1]["month"],
        "monthly": breakdown,
    }


def get_sponsorship_summary(db: Session, creator_id: int):
    deals = db.query(Sponsorship).filter(Sponsorship.creator_id == creator_id).all()

    total_value = sum(d.deal_amount for d in deals)
    by_status = defaultdict(int)
    for d in deals:
        by_status[d.status] += 1

    return {
        "creator_id": creator_id,
        "total_deals": len(deals),
        "total_deal_value": round(total_value, 2),
        "by_status": dict(by_status),
    }
