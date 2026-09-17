from collections import Counter
from sqlalchemy.orm import Session

from app.models.audience import Audience
from app.models.growth import Growth


def get_total_followers(db: Session, creator_id: int) -> int:
    records = db.query(Audience).filter(Audience.creator_id == creator_id).all()
    return sum(r.followers for r in records)


def get_total_reach(db: Session, creator_id: int) -> int:
    records = db.query(Audience).filter(Audience.creator_id == creator_id).all()
    return sum(r.reach for r in records)


def get_total_impressions(db: Session, creator_id: int) -> int:
    records = db.query(Audience).filter(Audience.creator_id == creator_id).all()
    return sum(r.impressions for r in records)


def get_gender_distribution(db: Session, creator_id: int) -> dict:
    records = db.query(Audience).filter(Audience.creator_id == creator_id).all()
    counts = Counter(r.gender for r in records)
    total = sum(counts.values())
    if total == 0:
        return {}
    return {gender: round((count / total) * 100, 2) for gender, count in counts.items()}


def get_age_distribution(db: Session, creator_id: int) -> dict:
    records = db.query(Audience).filter(Audience.creator_id == creator_id).all()
    counts = Counter(r.age_group for r in records)
    total = sum(counts.values())
    if total == 0:
        return {}
    return {age_group: round((count / total) * 100, 2) for age_group, count in counts.items()}


def get_top_countries(db: Session, creator_id: int, limit: int = 5) -> list:
    records = db.query(Audience).filter(Audience.creator_id == creator_id).all()
    counts = Counter(r.country for r in records)
    return [country for country, _ in counts.most_common(limit)]


def get_top_cities(db: Session, creator_id: int, limit: int = 5) -> list:
    records = db.query(Audience).filter(Audience.creator_id == creator_id).all()
    counts = Counter(r.city for r in records)
    return [city for city, _ in counts.most_common(limit)]


def get_device_distribution(db: Session, creator_id: int) -> dict:
    records = db.query(Audience).filter(Audience.creator_id == creator_id).all()
    counts = Counter(r.device_type for r in records)
    total = sum(counts.values())
    if total == 0:
        return {}
    return {device: round((count / total) * 100, 2) for device, count in counts.items()}


def get_active_hours_distribution(db: Session, creator_id: int) -> dict:
    """Aggregated count of audience records per active hour (0-23), scoped to the creator."""
    records = db.query(Audience).filter(Audience.creator_id == creator_id).all()
    counts = Counter(r.active_hour for r in records)
    return {str(hour): counts.get(hour, 0) for hour in range(24)}


def get_audience_report(db: Session, creator_id: int) -> dict:
    top_countries = get_top_countries(db, creator_id, limit=5)
    top_cities = get_top_cities(db, creator_id, limit=5)
    device_dist = get_device_distribution(db, creator_id)
    top_device = max(device_dist, key=device_dist.get) if device_dist else None

    return {
        "total_followers": get_total_followers(db, creator_id),
        "total_reach": get_total_reach(db, creator_id),
        "total_impressions": get_total_impressions(db, creator_id),
        "gender_distribution": get_gender_distribution(db, creator_id),
        "age_distribution": get_age_distribution(db, creator_id),
        "top_country": top_countries[0] if top_countries else None,
        "top_city": top_cities[0] if top_cities else None,
        "top_countries": top_countries,
        "top_cities": top_cities,
        "top_device": top_device,
        "device_distribution": device_dist,
        "active_hours_distribution": get_active_hours_distribution(db, creator_id)
    }


def get_growth_report(db: Session, creator_id: int, days: int = 30, start_date=None, end_date=None) -> list:
    query = db.query(Growth).filter(Growth.creator_id == creator_id)
    if start_date:
        query = query.filter(Growth.date >= start_date)
    if end_date:
        query = query.filter(Growth.date <= end_date)
    all_records = query.order_by(Growth.date.asc()).all()

    daily_totals = {}
    for record in all_records:
        if record.date not in daily_totals:
            daily_totals[record.date] = 0
        daily_totals[record.date] += record.followers

    sorted_dates = sorted(daily_totals.keys())
    # Only apply the `days` cap when no explicit date range was requested -
    # an explicit range means the caller wants exactly that window.
    if not start_date and not end_date:
        sorted_dates = sorted_dates[:days]

    result = []
    previous_followers = None

    for d in sorted_dates:
        followers = daily_totals[d]
        if previous_followers is None:
            daily_growth = 0
            growth_percentage = 0.0
        else:
            daily_growth = followers - previous_followers
            growth_percentage = round((daily_growth / previous_followers) * 100, 2) if previous_followers > 0 else 0.0

        result.append({
            "date": d,
            "followers": followers,
            "daily_growth": daily_growth,
            "growth_percentage": growth_percentage
        })
        previous_followers = followers

    return result


def get_audience_trends(db: Session, creator_id: int) -> list:
    all_records = db.query(Growth).filter(
        Growth.creator_id == creator_id
    ).order_by(Growth.date.asc()).all()

    daily_totals = {}
    for record in all_records:
        if record.date not in daily_totals:
            daily_totals[record.date] = {"followers": 0, "reach": 0}
        daily_totals[record.date]["followers"] += record.followers
        daily_totals[record.date]["reach"] += record.reach

    sorted_dates = sorted(daily_totals.keys())

    result = []
    for d in sorted_dates:
        result.append({
            "date": d,
            "followers": daily_totals[d]["followers"],
            "reach": daily_totals[d]["reach"]
        })

    return result
