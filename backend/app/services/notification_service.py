from datetime import date, timedelta
from sqlalchemy.orm import Session
from app.models.content import Content
from app.models.growth import Growth
from app.models.revenue import RevenueRecord
from app.services.analytics_service import calculate_engagement_rate


def performance_alerts(db: Session, creator_id: int) -> list[dict]:
    items = db.query(Content).filter(Content.creator_id == creator_id).all()
    if not items:
        return []
    rates = [calculate_engagement_rate(c) for c in items]
    avg_rate = sum(rates) / len(rates)

    alerts = []
    for c in items:
        rate = calculate_engagement_rate(c)
        if rate > avg_rate * 1.5:
            alerts.append({"type": "high_performance", "content_title": c.content_title,
                            "engagement_rate": rate, "message": "Performing significantly above average"})
        elif rate < avg_rate * 0.5:
            alerts.append({"type": "low_performance", "content_title": c.content_title,
                            "engagement_rate": rate, "message": "Performing significantly below average"})
    return alerts


def revenue_alerts(db: Session, creator_id: int, threshold_pct: float = 30.0) -> list[dict]:
    records = (
        db.query(RevenueRecord)
        .filter(RevenueRecord.creator_id == creator_id)
        .order_by(RevenueRecord.earned_date.asc())
        .all()
    )
    if len(records) < 2:
        return []

    alerts = []
    for i in range(1, len(records)):
        prev, curr = records[i - 1].amount, records[i].amount
        if prev == 0:
            continue
        change_pct = ((curr - prev) / prev) * 100
        if abs(change_pct) >= threshold_pct:
            alerts.append({
                "type": "revenue_spike" if change_pct > 0 else "revenue_drop",
                "date": records[i].earned_date.isoformat(),
                "change_percentage": round(change_pct, 2),
                "amount": curr,
            })
    return alerts


def weekly_report(db: Session, creator_id: int) -> dict:
    week_ago = date.today() - timedelta(days=7)

    content_items = (
        db.query(Content)
        .filter(Content.creator_id == creator_id, Content.published_date >= week_ago)
        .all()
    )
    growth_records = (
        db.query(Growth)
        .filter(Growth.creator_id == creator_id, Growth.date >= week_ago)
        .all()
    )
    revenue_records = (
        db.query(RevenueRecord)
        .filter(RevenueRecord.creator_id == creator_id, RevenueRecord.earned_date >= week_ago)
        .all()
    )

    return {
        "period": f"{week_ago.isoformat()} to {date.today().isoformat()}",
        "new_content_count": len(content_items),
        "total_views": sum(c.views for c in content_items),
        "follower_growth": (growth_records[-1].followers - growth_records[0].followers) if len(growth_records) >= 2 else 0,
        "total_revenue": round(sum(r.amount for r in revenue_records), 2),
    }