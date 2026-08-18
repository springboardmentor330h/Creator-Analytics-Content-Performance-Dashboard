from collections import Counter
from sqlalchemy.orm import Session

from app.models.audience import Audience
from app.models.growth import Growth


def get_total_followers(db: Session):
    records = db.query(Audience).all()
    return sum(record.followers for record in records)


def get_total_reach(db: Session):
    records = db.query(Audience).all()
    return sum(record.reach for record in records)


def get_total_impressions(db: Session):
    records = db.query(Audience).all()
    return sum(record.impressions for record in records)


def get_gender_distribution(db: Session):
    records = db.query(Audience).all()

    total = len(records)

    if total == 0:
        return {}

    counts = Counter(record.gender for record in records)

    return {
        gender: round((count / total) * 100, 2)
        for gender, count in counts.items()
    }


def get_age_distribution(db: Session):
    records = db.query(Audience).all()

    counts = Counter(record.age_group for record in records)

    return dict(counts)


def get_top_countries(db: Session):
    records = db.query(Audience).all()

    counts = Counter(record.country for record in records)

    return counts.most_common(5)


def get_top_cities(db: Session):
    records = db.query(Audience).all()

    counts = Counter(record.city for record in records)

    return counts.most_common(5)


def get_device_distribution(db: Session):
    records = db.query(Audience).all()

    counts = Counter(record.device_type for record in records)

    return dict(counts)


def get_growth_trend(db: Session):
    records = (
        db.query(Growth)
        .order_by(Growth.date.asc())
        .limit(30)
        .all()
    )

    result = []

    previous_followers = None

    for record in records:
        daily_growth = 0
        growth_percentage = 0

        if previous_followers is not None:
            daily_growth = record.followers - previous_followers

            if previous_followers > 0:
                growth_percentage = round(
                    (daily_growth / previous_followers) * 100,
                    2
                )

        result.append({
            "date": record.date,
            "followers": record.followers,
            "daily_growth": daily_growth,
            "growth_percentage": growth_percentage
        })

        previous_followers = record.followers

    return result