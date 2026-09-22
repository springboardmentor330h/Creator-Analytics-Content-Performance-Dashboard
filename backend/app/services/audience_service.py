from sqlalchemy.orm import Session
from app.models.audience import Audience
from app.models.growth import Growth


def _apply_filter(query, model, allowed):
    if allowed is not None:
        query = query.filter(model.creator_id.in_(allowed))
    return query


def total_followers(db: Session, allowed=None) -> int:
    return sum(a.followers for a in _apply_filter(db.query(Audience), Audience, allowed).all())


def total_reach(db: Session, allowed=None) -> int:
    return sum(a.reach for a in _apply_filter(db.query(Audience), Audience, allowed).all())


def total_impressions(db: Session, allowed=None) -> int:
    return sum(a.impressions for a in _apply_filter(db.query(Audience), Audience, allowed).all())


def _distribution(db: Session, field: str, allowed=None) -> dict:
    records = _apply_filter(db.query(Audience), Audience, allowed).all()
    total = sum(r.followers for r in records)
    grouped: dict[str, int] = {}
    for r in records:
        key = getattr(r, field)
        grouped[key] = grouped.get(key, 0) + r.followers
    if total == 0:
        return {k: 0 for k in grouped}
    return {k: round((v / total) * 100, 2) for k, v in grouped.items()}


def gender_distribution(db: Session, allowed=None) -> dict:
    return _distribution(db, "gender", allowed)


def age_distribution(db: Session, allowed=None) -> dict:
    return _distribution(db, "age_group", allowed)


def _top_by(db: Session, field: str, limit: int = 5, allowed=None) -> list[dict]:
    records = _apply_filter(db.query(Audience), Audience, allowed).all()
    grouped: dict[str, int] = {}
    for r in records:
        key = getattr(r, field)
        grouped[key] = grouped.get(key, 0) + r.followers
    ranked = sorted(grouped.items(), key=lambda x: x[1], reverse=True)
    return [{field: k, "followers": v} for k, v in ranked[:limit]]


def top_countries(db: Session, limit: int = 5, allowed=None) -> list[dict]:
    return _top_by(db, "country", limit, allowed)


def top_cities(db: Session, limit: int = 5, allowed=None) -> list[dict]:
    return _top_by(db, "city", limit, allowed)


def device_distribution(db: Session, allowed=None) -> dict:
    return _distribution(db, "device_type", allowed)


def get_audience_report(db: Session, allowed=None) -> dict:
    countries = top_countries(db, limit=1, allowed=allowed)
    cities = top_cities(db, limit=1, allowed=allowed)
    devices = device_distribution(db, allowed=allowed)
    top_device = max(devices, key=devices.get) if devices else None

    return {
        "total_followers": total_followers(db, allowed),
        "total_reach": total_reach(db, allowed),
        "total_impressions": total_impressions(db, allowed),
        "gender_distribution": gender_distribution(db, allowed),
        "age_distribution": age_distribution(db, allowed),
        "top_country": countries[0]["country"] if countries else None,
        "top_city": cities[0]["city"] if cities else None,
        "top_device": top_device,
    }


def get_growth_report(db: Session, days: int = 30, allowed_creator_ids=None) -> list[dict]:
    query = db.query(Growth)
    if allowed_creator_ids is not None:
        query = query.filter(Growth.creator_id.in_(allowed_creator_ids))
    records = query.order_by(Growth.date.asc()).all()
    records = records[-days:]

    report = []
    prev_followers = None
    for r in records:
        daily_growth = 0
        growth_pct = 0.0
        if prev_followers is not None:
            daily_growth = r.followers - prev_followers
            growth_pct = round((daily_growth / prev_followers) * 100, 2) if prev_followers > 0 else 0.0
        report.append({
            "date": r.date.isoformat(),
            "followers": r.followers,
            "daily_growth": daily_growth,
            "growth_percentage": growth_pct,
        })
        prev_followers = r.followers
    return report


def get_audience_trends(db: Session, allowed=None) -> list[dict]:
    query = db.query(Growth)
    if allowed is not None:
        query = query.filter(Growth.creator_id.in_(allowed))
    records = query.order_by(Growth.date.asc()).all()
    return [{"date": r.date.isoformat(), "followers": r.followers, "reach": r.reach} for r in records]