import re
from collections import Counter
from sqlalchemy.orm import Session
from app.models.content import Content
from app.models.growth import Growth


def hashtag_analysis(db: Session, limit: int = 10) -> list[dict]:
    titles = [c.content_title for c in db.query(Content).all()]
    words = []
    for title in titles:
        tags = re.findall(r"#(\w+)", title)
        words.extend(tags)
        if not tags:
            words.extend([w.lower() for w in re.findall(r"\b[A-Z][a-z]{3,}\b", title)])
    counts = Counter(words)
    return [{"tag": tag, "count": count} for tag, count in counts.most_common(limit)]


def reach_prediction(db: Session, creator_id: int) -> dict:
    records = (
        db.query(Growth)
        .filter(Growth.creator_id == creator_id)
        .order_by(Growth.date.asc())
        .all()
    )
    if len(records) < 2:
        return {"predicted_reach_next_period": 0, "message": "Not enough data"}

    half = len(records) // 2 or 1
    first_avg = sum(r.reach for r in records[:half]) / half
    second_avg = sum(r.reach for r in records[half:]) / max(len(records) - half, 1)
    growth_rate = (second_avg - first_avg) / max(first_avg, 1)

    latest_reach = records[-1].reach
    predicted = int(latest_reach + latest_reach * max(growth_rate, 0))
    return {"predicted_reach_next_period": predicted, "growth_rate_pct": round(growth_rate * 100, 2)}


def content_growth_tracking(db: Session, creator_id: int) -> list[dict]:
    items = (
        db.query(Content)
        .filter(Content.creator_id == creator_id)
        .order_by(Content.published_date.asc())
        .all()
    )
    monthly: dict[str, int] = {}
    for c in items:
        key = c.published_date.strftime("%Y-%m")
        monthly[key] = monthly.get(key, 0) + 1
    return [{"month": k, "content_count": v} for k, v in sorted(monthly.items())]


def audience_growth_forecast(db: Session, creator_id: int, days_ahead: int = 30) -> dict:
    records = (
        db.query(Growth)
        .filter(Growth.creator_id == creator_id)
        .order_by(Growth.date.asc())
        .all()
    )
    if len(records) < 2:
        return {"forecasted_followers": 0, "message": "Not enough historical data"}

    first, last = records[0], records[-1]
    days_span = (last.date - first.date).days or 1
    daily_rate = (last.followers - first.followers) / days_span

    forecasted = int(last.followers + daily_rate * days_ahead)
    return {
        "current_followers": last.followers,
        "daily_growth_rate": round(daily_rate, 2),
        "forecasted_followers_in_days": days_ahead,
        "forecasted_followers": forecasted,
    }


def trend_direction(db: Session, creator_id: int) -> str:
    records = (
        db.query(Growth)
        .filter(Growth.creator_id == creator_id)
        .order_by(Growth.date.asc())
        .all()
    )
    if len(records) < 2:
        return "stable"
    half = len(records) // 2 or 1
    first_avg = sum(r.followers for r in records[:half]) / half
    second_avg = sum(r.followers for r in records[half:]) / max(len(records) - half, 1)
    if second_avg > first_avg * 1.05:
        return "up"
    elif second_avg < first_avg * 0.95:
        return "down"
    return "stable"