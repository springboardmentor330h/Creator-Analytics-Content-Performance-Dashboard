from collections import defaultdict
from uuid import UUID

from sqlalchemy.orm import Session

from app.models.audience import Audience


def report(
    db: Session,
    creator_id: UUID | None = None,
):
    query = db.query(Audience)

    if creator_id is not None:
        query = query.filter(
            Audience.creator_id == creator_id
        )

    rows = query.all()

    if not rows:
        return {
            "total_records": 0,
            "total_followers": 0,
            "total_impressions": 0,
            "total_reach": 0,
            "age_distribution": {},
            "gender_distribution": {},
            "country_distribution": {},
            "city_distribution": {},
            "device_distribution": {},
            "active_hours": {},
        }

    age_distribution = defaultdict(int)
    gender_distribution = defaultdict(int)
    country_distribution = defaultdict(int)
    city_distribution = defaultdict(int)
    device_distribution = defaultdict(int)
    active_hours = defaultdict(int)

    total_followers = 0
    total_impressions = 0
    total_reach = 0

    for row in rows:
        total_followers += row.followers or 0
        total_impressions += row.impressions or 0
        total_reach += row.reach or 0

        age_distribution[row.age_group] += 1
        gender_distribution[row.gender] += 1
        country_distribution[row.country] += 1
        city_distribution[row.city] += 1
        device_distribution[row.device_type] += 1
        active_hours[str(row.active_hour)] += 1

    return {
        "total_records": len(rows),
        "total_followers": total_followers,
        "total_impressions": total_impressions,
        "total_reach": total_reach,
        "age_distribution": dict(age_distribution),
        "gender_distribution": dict(gender_distribution),
        "country_distribution": dict(country_distribution),
        "city_distribution": dict(city_distribution),
        "device_distribution": dict(device_distribution),
        "active_hours": dict(active_hours),
    }
