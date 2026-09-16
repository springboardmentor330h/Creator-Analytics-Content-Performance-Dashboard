from collections import Counter

from sqlalchemy.orm import Session

from app.models.audience import Audience


def _distribution(records, field: str):
    """Turns a list of Audience rows into a {value: percent} breakdown."""
    values = [getattr(r, field) for r in records if getattr(r, field)]

    if not values:
        return {}

    counts = Counter(values)
    total = sum(counts.values())

    return {
        key: round((count / total) * 100, 2)
        for key, count in counts.most_common()
    }


def get_audience_demographics(db: Session, creator_id: int):
    records = db.query(Audience).filter(Audience.creator_id == creator_id).all()

    if not records:
        return {
            "creator_id": creator_id,
            "total_followers": 0,
            "age_distribution": {},
            "gender_distribution": {},
            "device_distribution": {},
        }

    total_followers = sum(r.follower_count for r in records)

    return {
        "creator_id": creator_id,
        "total_followers": total_followers,
        "age_distribution": _distribution(records, "age_group"),
        "gender_distribution": _distribution(records, "gender"),
        "device_distribution": _distribution(records, "device"),
    }


def get_top_locations(db: Session, creator_id: int, limit: int = 5):
    records = db.query(Audience).filter(Audience.creator_id == creator_id).all()

    countries = Counter(r.country for r in records if r.country)
    cities = Counter(r.city for r in records if r.city)

    return {
        "top_countries": [
            {"country": c, "count": n} for c, n in countries.most_common(limit)
        ],
        "top_cities": [
            {"city": c, "count": n} for c, n in cities.most_common(limit)
        ],
    }


def get_active_hours(db: Session, creator_id: int):
    """Returns a 0-23 histogram of when this creator's audience is most active."""
    records = (
        db.query(Audience)
        .filter(Audience.creator_id == creator_id, Audience.active_hour.isnot(None))
        .all()
    )

    histogram = {hour: 0 for hour in range(24)}
    for r in records:
        histogram[r.active_hour] += 1

    return histogram
