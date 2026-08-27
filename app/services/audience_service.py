from sqlalchemy.orm import Session
from sqlalchemy import func

from app.models.audience import Audience
from app.models.growth import Growth


def get_total_followers(
    db: Session,
    creator_id: int
):
    return (
        db.query(func.sum(Audience.followers))
        .filter(Audience.creator_id == creator_id)
        .scalar()
        or 0
    )


def get_total_reach(
    db: Session,
    creator_id: int
):
    return (
        db.query(func.sum(Audience.reach))
        .filter(Audience.creator_id == creator_id)
        .scalar()
        or 0
    )


def get_total_impressions(
    db: Session,
    creator_id: int
):
    return (
        db.query(func.sum(Audience.impressions))
        .filter(Audience.creator_id == creator_id)
        .scalar()
        or 0
    )


def get_gender_distribution(
    db: Session,
    creator_id: int
):
    results = (
        db.query(
            Audience.gender,
            func.count(Audience.id)
        )
        .filter(Audience.creator_id == creator_id)
        .group_by(Audience.gender)
        .all()
    )

    total = sum(count for _, count in results)

    if total == 0:
        return {}

    return {
        gender: round((count / total) * 100, 2)
        for gender, count in results
    }


def get_age_distribution(
    db: Session,
    creator_id: int
):
    results = (
        db.query(
            Audience.age_group,
            func.count(Audience.id)
        )
        .filter(Audience.creator_id == creator_id)
        .group_by(Audience.age_group)
        .all()
    )

    total = sum(count for _, count in results)

    if total == 0:
        return {}

    return {
        age_group: round((count / total) * 100, 2)
        for age_group, count in results
    }


def get_top_countries(
    db: Session,
    creator_id: int
):
    results = (
        db.query(
            Audience.country,
            func.count(Audience.id).label("count")
        )
        .filter(Audience.creator_id == creator_id)
        .group_by(Audience.country)
        .order_by(func.count(Audience.id).desc())
        .all()
    )

    return [
        {
            "country": country,
            "count": count
        }
        for country, count in results
    ]


def get_top_cities(
    db: Session,
    creator_id: int
):
    results = (
        db.query(
            Audience.city,
            func.count(Audience.id).label("count")
        )
        .filter(Audience.creator_id == creator_id)
        .group_by(Audience.city)
        .order_by(func.count(Audience.id).desc())
        .all()
    )

    return [
        {
            "city": city,
            "count": count
        }
        for city, count in results
    ]


def get_device_distribution(
    db: Session,
    creator_id: int
):
    results = (
        db.query(
            Audience.device_type,
            func.count(Audience.id)
        )
        .filter(Audience.creator_id == creator_id)
        .group_by(Audience.device_type)
        .all()
    )

    total = sum(count for _, count in results)

    if total == 0:
        return {}

    return {
        device: round((count / total) * 100, 2)
        for device, count in results
    }


def get_growth_trend(
    db: Session,
    creator_id: int,
    days: int = 30
):
    growth_records = (
        db.query(Growth)
        .filter(Growth.creator_id == creator_id)
        .order_by(Growth.date.desc())
        .limit(days)
        .all()
    )

    growth_records.reverse()

    result = []

    previous_followers = None

    for record in growth_records:

        if previous_followers is None:
            daily_growth = 0
            growth_percentage = 0
        else:
            daily_growth = record.followers - previous_followers

            if previous_followers == 0:
                growth_percentage = 0
            else:
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


def get_audience_trends(
    db: Session,
    creator_id: int,
    days: int = 30
):
    growth_records = (
        db.query(Growth)
        .filter(Growth.creator_id == creator_id)
        .order_by(Growth.date.desc())
        .limit(days)
        .all()
    )

    growth_records.reverse()

    return [
        {
            "date": record.date,
            "followers": record.followers,
            "reach": record.reach
        }
        for record in growth_records
    ]