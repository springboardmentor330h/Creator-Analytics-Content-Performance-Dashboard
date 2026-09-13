from collections import Counter

from sqlalchemy.orm import Session

from app.models.audience import Audience
from app.models.growth import Growth


def _distribution(rows, attribute):
    counts = Counter(
        getattr(row, attribute)
        for row in rows
    )

    total = sum(counts.values())

    if not total:
        return {}

    return {
        key: round((value / total) * 100, 2)
        for key, value in counts.items()
    }


def report(db: Session):
    rows = db.query(Audience).all()

    gender = _distribution(rows, "gender")
    age = _distribution(rows, "age_group")

    countries = Counter(
        row.country for row in rows
    )

    cities = Counter(
        row.city for row in rows
    )

    devices = Counter(
        row.device_type for row in rows
    )

    return {
        "total_followers": sum(
            row.followers or 0
            for row in rows
        ),

        "total_reach": sum(
            row.reach or 0
            for row in rows
        ),

        "total_impressions": sum(
            row.impressions or 0
            for row in rows
        ),

        "gender_distribution": gender,

        "age_distribution": age,

        "top_countries": [
            {
                "country": key,
                "count": value,
            }
            for key, value in countries.most_common(5)
        ],

        "top_cities": [
            {
                "city": key,
                "count": value,
            }
            for key, value in cities.most_common(5)
        ],

        "device_usage": _distribution(
            rows,
            "device_type",
        ),

        "top_country": (
            countries.most_common(1)[0][0]
            if countries
            else None
        ),

        "top_city": (
            cities.most_common(1)[0][0]
            if cities
            else None
        ),

        "top_device": (
            devices.most_common(1)[0][0]
            if devices
            else None
        ),
    }


def growth_report(db: Session, days: int = 30):
    rows = (
        db.query(Growth)
        .order_by(Growth.date.desc())
        .limit(days)
        .all()
    )

    rows = sorted(
        rows,
        key=lambda row: row.date,
    )

    result = []
    previous_followers = None

    for growth in rows:
        followers = growth.followers or 0

        if previous_followers is None:
            daily_growth = 0
            growth_percentage = 0
        else:
            daily_growth = (
                followers - previous_followers
            )

            growth_percentage = (
                (daily_growth / previous_followers) * 100
                if previous_followers
                else 0
            )

        result.append(
            {
                "date": growth.date.isoformat(),
                "followers": followers,
                "daily_growth": daily_growth,
                "growth_percentage": round(
                    growth_percentage,
                    2,
                ),
            }
        )

        previous_followers = followers

    return result


def trends(db: Session, days: int = 30):
    rows = (
        db.query(Growth)
        .order_by(Growth.date.desc())
        .limit(days)
        .all()
    )

    rows = sorted(
        rows,
        key=lambda row: row.date,
    )

    return [
        {
            "date": growth.date.isoformat(),
            "followers": growth.followers or 0,
            "reach": growth.reach or 0,
        }
        for growth in rows
    ]
