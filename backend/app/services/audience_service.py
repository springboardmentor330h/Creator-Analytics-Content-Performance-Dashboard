from sqlalchemy.orm import Session
from app.models.audience import Audience
from app.models.growth import Growth


# 1. Total Followers
def get_total_followers(db: Session):
    return db.query(Audience).with_entities(
        Audience.followers
    ).all()


# 2. Total Reach
def get_total_reach(db: Session):
    return db.query(Audience).with_entities(
        Audience.reach
    ).all()


# 3. Total Impressions
def get_total_impressions(db: Session):
    return db.query(Audience).with_entities(
        Audience.impressions
    ).all()


# 4. Gender Distribution
def get_gender_distribution(db: Session):
    records = db.query(Audience).all()

    total = len(records)

    if total == 0:
        return {}

    distribution = {}

    for record in records:
        gender = record.gender.lower()

        distribution[gender] = (
            distribution.get(gender, 0) + 1
        )

    return {
        gender: round((count / total) * 100, 2)
        for gender, count in distribution.items()
    }


# 5. Age Distribution
def get_age_distribution(db: Session):
    records = db.query(Audience).all()

    distribution = {}

    for record in records:
        age_group = record.age_group

        distribution[age_group] = (
            distribution.get(age_group, 0) + 1
        )

    return distribution


# 6. Top Countries
def get_top_countries(db: Session):
    records = db.query(Audience).all()

    countries = {}

    for record in records:
        country = record.country

        countries[country] = (
            countries.get(country, 0) + 1
        )

    return dict(
        sorted(
            countries.items(),
            key=lambda item: item[1],
            reverse=True
        )[:5]
    )


# 7. Top Cities
def get_top_cities(db: Session):
    records = db.query(Audience).all()

    cities = {}

    for record in records:
        city = record.city

        cities[city] = (
            cities.get(city, 0) + 1
        )

    return dict(
        sorted(
            cities.items(),
            key=lambda item: item[1],
            reverse=True
        )[:5]
    )


# 8. Device Distribution
def get_device_distribution(db: Session):
    records = db.query(Audience).all()

    devices = {}

    for record in records:
        device = record.device_type

        devices[device] = (
            devices.get(device, 0) + 1
        )

    return devices


# 9. Growth Trend
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

            daily_growth = (
                record.followers - previous_followers
            )

            if previous_followers > 0:
                growth_percentage = (
                    daily_growth / previous_followers
                ) * 100

        result.append({
            "date": record.date,
            "followers": record.followers,
            "daily_growth": daily_growth,
            "growth_percentage": round(
                growth_percentage, 2
            )
        })

        previous_followers = record.followers

    return result


# 10. Complete Audience Analytics
def get_audience_analytics(db: Session):

    audience_records = db.query(Audience).all()

    total_followers = sum(
        record.followers
        for record in audience_records
    )

    total_reach = sum(
        record.reach
        for record in audience_records
    )

    total_impressions = sum(
        record.impressions
        for record in audience_records
    )

    gender_distribution = get_gender_distribution(db)
    age_distribution = get_age_distribution(db)
    top_countries = get_top_countries(db)
    top_cities = get_top_cities(db)
    device_distribution = get_device_distribution(db)

    return {
        "total_followers": total_followers,
        "total_reach": total_reach,
        "total_impressions": total_impressions,
        "gender_distribution": gender_distribution,
        "age_distribution": age_distribution,
        "top_countries": top_countries,
        "top_cities": top_cities,
        "device_usage": device_distribution
    }