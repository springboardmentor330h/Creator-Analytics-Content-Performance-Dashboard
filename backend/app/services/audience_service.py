from collections import Counter
from sqlalchemy.orm import Session

from app.models.audience import Audience
from app.models.growth import Growth


def get_total_followers(db: Session) -> int:
    records = db.query(Audience).all()
    return sum(r.followers for r in records)


def get_total_reach(db: Session) -> int:
    records = db.query(Audience).all()
    return sum(r.reach for r in records)


def get_total_impressions(db: Session) -> int:
    records = db.query(Audience).all()
    return sum(r.impressions for r in records)


def get_gender_distribution(db: Session) -> dict:
    records = db.query(Audience).all()
    counts = Counter(r.gender for r in records)
    total = sum(counts.values())
    if total == 0:
        return {}
    return {gender: round((count / total) * 100, 2) for gender, count in counts.items()}


def get_age_distribution(db: Session) -> dict:
    records = db.query(Audience).all()
    counts = Counter(r.age_group for r in records)
    total = sum(counts.values())
    if total == 0:
        return {}
    return {age_group: round((count / total) * 100, 2) for age_group, count in counts.items()}


def get_top_countries(db: Session, limit: int = 5) -> list:
    records = db.query(Audience).all()
    counts = Counter(r.country for r in records)
    return [country for country, _ in counts.most_common(limit)]


def get_top_cities(db: Session, limit: int = 5) -> list:
    records = db.query(Audience).all()
    counts = Counter(r.city for r in records)
    return [city for city, _ in counts.most_common(limit)]


def get_device_distribution(db: Session) -> dict:
    records = db.query(Audience).all()
    counts = Counter(r.device_type for r in records)
    total = sum(counts.values())
    if total == 0:
        return {}
    return {device: round((count / total) * 100, 2) for device, count in counts.items()}


def get_audience_report(db: Session) -> dict:
    top_countries = get_top_countries(db, limit=1)
    top_cities = get_top_cities(db, limit=1)
    device_dist = get_device_distribution(db)
    top_device = max(device_dist, key=device_dist.get) if device_dist else None

    return {
        "total_followers": get_total_followers(db),
        "total_reach": get_total_reach(db),
        "total_impressions": get_total_impressions(db),
        "gender_distribution": get_gender_distribution(db),
        "age_distribution": get_age_distribution(db),
        "top_country": top_countries[0] if top_countries else None,
        "top_city": top_cities[0] if top_cities else None,
        "top_device": top_device
    }


def get_growth_report(db: Session, creator_id: int, days: int = 30) -> list:
    """Returns a clean day-by-day growth trend for ONE specific creator."""
    records = (
        db.query(Growth)
        .filter(Growth.creator_id == creator_id)
        .order_by(Growth.date.asc())
        .limit(days)
        .all()
    )

    result = []
    previous_followers = None

    for record in records:
        if previous_followers is None:
            daily_growth = 0
            growth_percentage = 0.0
        else:
            daily_growth = record.followers - previous_followers
            growth_percentage = round((daily_growth / previous_followers) * 100, 2) if previous_followers > 0 else 0.0

        result.append({
            "date": record.date,
            "followers": record.followers,
            "daily_growth": daily_growth,
            "growth_percentage": growth_percentage
        })
        previous_followers = record.followers

    return result


def get_audience_trends(db: Session, creator_id: int) -> list:
    """Returns chart-ready date/followers/reach data for ONE specific creator."""
    records = (
        db.query(Growth)
        .filter(Growth.creator_id == creator_id)
        .order_by(Growth.date.asc())
        .all()
    )
    return [
        {"date": r.date, "followers": r.followers, "reach": r.reach}
        for r in records
    ]