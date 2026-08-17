from datetime import date, timedelta

from sqlalchemy.orm import Session

from app.models.audience import Audience
from app.models.growth import Growth


def get_total_followers(db: Session):
    return db.query(Audience).with_entities(
        Audience.followers
    ).all()


def get_total_reach(db: Session):
    return db.query(Audience).with_entities(
        Audience.reach
    ).all()


def get_total_impressions(db: Session):
    return db.query(Audience).with_entities(
        Audience.impressions
    ).all()


def get_gender_distribution(db: Session):
    records = db.query(Audience).all()

    distribution = {}

    for record in records:
        gender = record.gender

        if gender not in distribution:
            distribution[gender] = 0

        distribution[gender] += record.followers

    return distribution


def get_age_distribution(db: Session):
    records = db.query(Audience).all()

    distribution = {}

    for record in records:
        age_group = record.age_group

        if age_group not in distribution:
            distribution[age_group] = 0

        distribution[age_group] += record.followers

    return distribution


def get_top_countries(db: Session, limit=5):
    records = db.query(Audience).all()

    country_data = {}

    for record in records:
        country = record.country

        if country not in country_data:
            country_data[country] = 0

        country_data[country] += record.followers

    sorted_countries = sorted(
        country_data.items(),
        key=lambda x: x[1],
        reverse=True
    )

    return [
        {
            "country": country,
            "followers": followers
        }
        for country, followers in sorted_countries[:limit]
    ]


def get_top_cities(db: Session, limit=5):
    records = db.query(Audience).all()

    city_data = {}

    for record in records:
        city = record.city

        if city not in city_data:
            city_data[city] = 0

        city_data[city] += record.followers

    sorted_cities = sorted(
        city_data.items(),
        key=lambda x: x[1],
        reverse=True
    )

    return [
        {
            "city": city,
            "followers": followers
        }
        for city, followers in sorted_cities[:limit]
    ]


def get_device_distribution(db: Session):
    records = db.query(Audience).all()

    distribution = {}

    for record in records:
        device = record.device_type

        if device not in distribution:
            distribution[device] = 0

        distribution[device] += record.followers

    return distribution


def get_audience_report(db: Session):
    records = db.query(Audience).all()

    total_followers = sum(
        record.followers for record in records
    )

    total_reach = sum(
        record.reach for record in records
    )

    total_impressions = sum(
        record.impressions for record in records
    )

    return {
        "total_followers": total_followers,
        "total_reach": total_reach,
        "total_impressions": total_impressions,
        "gender_distribution": get_gender_distribution(db),
        "age_distribution": get_age_distribution(db),
        "top_countries": get_top_countries(db),
        "top_cities": get_top_cities(db),
        "device_distribution": get_device_distribution(db)
    }


def get_growth_report(db: Session):
    growth_records = (
        db.query(Growth)
        .order_by(Growth.date.desc())
        .limit(30)
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
            daily_growth = (
                record.followers - previous_followers
            )

            if previous_followers == 0:
                growth_percentage = 0
            else:
                growth_percentage = (
                    daily_growth / previous_followers
                ) * 100

        result.append({
            "date": record.date,
            "followers": record.followers,
            "daily_growth": daily_growth,
            "growth_percentage": round(
                growth_percentage,
                2
            )
        })

        previous_followers = record.followers

    return result


def get_audience_trends(db: Session):
    growth_records = (
        db.query(Growth)
        .order_by(Growth.date.asc())
        .limit(30)
        .all()
    )

    return [
        {
            "date": record.date,
            "followers": record.followers,
            "reach": record.reach
        }
        for record in growth_records
    ]