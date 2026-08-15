from collections import Counter

from sqlalchemy.orm import Session

from app.models.audience import Audience
from app.models.growth import Growth


# -----------------------------
# Basic audience totals
# -----------------------------

def get_total_followers(db: Session) -> int:
    audiences = db.query(Audience).all()

    return sum(
        audience.followers
        for audience in audiences
    )


def get_total_reach(db: Session) -> int:
    audiences = db.query(Audience).all()

    return sum(
        audience.reach
        for audience in audiences
    )


def get_total_impressions(db: Session) -> int:
    audiences = db.query(Audience).all()

    return sum(
        audience.impressions
        for audience in audiences
    )


# -----------------------------
# Audience distributions
# -----------------------------

def get_gender_distribution(db: Session) -> dict:
    audiences = db.query(Audience).all()

    if not audiences:
        return {}

    counts = Counter(
        audience.gender.lower()
        for audience in audiences
    )

    total = len(audiences)

    return {
        gender: round(
            (count / total) * 100,
            2,
        )
        for gender, count in counts.items()
    }


def get_age_distribution(db: Session) -> dict:
    audiences = db.query(Audience).all()

    if not audiences:
        return {}

    counts = Counter(
        audience.age_group
        for audience in audiences
    )

    total = len(audiences)

    return {
        age_group: round(
            (count / total) * 100,
            2,
        )
        for age_group, count in counts.items()
    }


def get_top_countries(
    db: Session,
    limit: int = 5,
) -> list:
    audiences = db.query(Audience).all()

    counts = Counter(
        audience.country
        for audience in audiences
    )

    return [
        {
            "country": country,
            "count": count,
        }
        for country, count in counts.most_common(limit)
    ]


def get_top_cities(
    db: Session,
    limit: int = 5,
) -> list:
    audiences = db.query(Audience).all()

    counts = Counter(
        audience.city
        for audience in audiences
    )

    return [
        {
            "city": city,
            "count": count,
        }
        for city, count in counts.most_common(limit)
    ]


def get_device_distribution(db: Session) -> dict:
    audiences = db.query(Audience).all()

    if not audiences:
        return {}

    counts = Counter(
        audience.device_type
        for audience in audiences
    )

    total = len(audiences)

    return {
        device: round(
            (count / total) * 100,
            2,
        )
        for device, count in counts.items()
    }


# -----------------------------
# Growth trend generation
# -----------------------------

def get_growth_trend(
    db: Session,
    limit: int = 30,
) -> list:
    growth_records = (
        db.query(Growth)
        .order_by(Growth.date.asc())
        .limit(limit)
        .all()
    )

    results = []

    previous_followers = None

    for record in growth_records:

        if previous_followers is None:
            daily_growth = 0
            growth_percentage = 0
        else:
            daily_growth = (
                record.followers
                - previous_followers
            )

            if previous_followers > 0:
                growth_percentage = (
                    daily_growth
                    / previous_followers
                ) * 100
            else:
                growth_percentage = 0

        results.append({
            "date": record.date,
            "followers": record.followers,
            "daily_growth": daily_growth,
            "growth_percentage": round(
                growth_percentage,
                2,
            ),
        })

        previous_followers = record.followers

    return results


# -----------------------------
# Audience trends
# -----------------------------

def get_audience_trends(
    db: Session,
    limit: int = 30,
) -> list:
    growth_records = (
        db.query(Growth)
        .order_by(Growth.date.asc())
        .limit(limit)
        .all()
    )

    return [
        {
            "date": record.date,
            "followers": record.followers,
            "reach": record.reach,
        }
        for record in growth_records
    ]