from sqlalchemy.orm import Session
from fastapi import HTTPException
from datetime import date, timedelta

from app.models.audience import Audience
from app.models.growth import Growth
from app.schemas.audience import AudienceCreate, AudienceUpdate


# =========================================================
# CREATE AUDIENCE RECORD
# =========================================================

def create_audience(
    db: Session,
    audience_data: AudienceCreate
):
    audience = Audience(
        creator_id=audience_data.creator_id,
        age_group=audience_data.age_group,
        gender=audience_data.gender,
        country=audience_data.country,
        city=audience_data.city,
        device_type=audience_data.device_type,
        active_hour=audience_data.active_hour,
        followers=audience_data.followers,
        impressions=audience_data.impressions,
        reach=audience_data.reach
    )

    db.add(audience)
    db.commit()
    db.refresh(audience)

    return audience


# =========================================================
# GET ALL AUDIENCE RECORDS
# =========================================================

def get_all_audience(db: Session):
    return db.query(Audience).all()


# =========================================================
# GET AUDIENCE BY ID
# =========================================================

def get_audience_by_id(
    db: Session,
    audience_id: int
):
    audience = (
        db.query(Audience)
        .filter(Audience.id == audience_id)
        .first()
    )

    if not audience:
        raise HTTPException(
            status_code=404,
            detail="Audience record not found"
        )

    return audience


# =========================================================
# UPDATE AUDIENCE RECORD
# =========================================================

def update_audience(
    db: Session,
    audience_id: int,
    audience_data: AudienceUpdate
):
    audience = (
        db.query(Audience)
        .filter(Audience.id == audience_id)
        .first()
    )

    if not audience:
        raise HTTPException(
            status_code=404,
            detail="Audience record not found"
        )

    update_data = audience_data.model_dump(
        exclude_unset=True
    )

    for field, value in update_data.items():
        setattr(audience, field, value)

    db.commit()
    db.refresh(audience)

    return audience


# =========================================================
# DELETE AUDIENCE RECORD
# =========================================================

def delete_audience(
    db: Session,
    audience_id: int
):
    audience = (
        db.query(Audience)
        .filter(Audience.id == audience_id)
        .first()
    )

    if not audience:
        raise HTTPException(
            status_code=404,
            detail="Audience record not found"
        )

    db.delete(audience)
    db.commit()

    return {
        "message": "Audience record deleted successfully"
    }


# =========================================================
# TOTAL FOLLOWERS
# =========================================================

def get_total_followers(db: Session):
    return (
        db.query(Audience.followers)
        .all()
    )


# =========================================================
# TOTAL REACH
# =========================================================

def get_total_reach(db: Session):
    return (
        db.query(Audience.reach)
        .all()
    )


# =========================================================
# TOTAL IMPRESSIONS
# =========================================================

def get_total_impressions(db: Session):
    return (
        db.query(Audience.impressions)
        .all()
    )


# =========================================================
# GENDER DISTRIBUTION
# =========================================================

def get_gender_distribution(db: Session):
    audience_records = db.query(Audience).all()

    total = len(audience_records)

    if total == 0:
        return {}

    distribution = {}

    for record in audience_records:
        gender = record.gender.lower()

        distribution[gender] = (
            distribution.get(gender, 0) + 1
        )

    return {
        gender: round(
            (count / total) * 100,
            2
        )
        for gender, count in distribution.items()
    }


# =========================================================
# AGE DISTRIBUTION
# =========================================================

def get_age_distribution(db: Session):
    audience_records = db.query(Audience).all()

    total = len(audience_records)

    if total == 0:
        return {}

    distribution = {}

    for record in audience_records:
        age_group = record.age_group

        distribution[age_group] = (
            distribution.get(age_group, 0) + 1
        )

    return {
        age_group: round(
            (count / total) * 100,
            2
        )
        for age_group, count in distribution.items()
    }


# =========================================================
# TOP COUNTRIES
# =========================================================

def get_top_countries(
    db: Session,
    limit: int = 5
):
    audience_records = db.query(Audience).all()

    countries = {}

    for record in audience_records:
        country = record.country

        countries[country] = (
            countries.get(country, 0) + 1
        )

    sorted_countries = sorted(
        countries.items(),
        key=lambda x: x[1],
        reverse=True
    )

    return [
        {
            "country": country,
            "count": count
        }
        for country, count in sorted_countries[:limit]
    ]


# =========================================================
# TOP CITIES
# =========================================================

def get_top_cities(
    db: Session,
    limit: int = 5
):
    audience_records = db.query(Audience).all()

    cities = {}

    for record in audience_records:
        city = record.city

        cities[city] = (
            cities.get(city, 0) + 1
        )

    sorted_cities = sorted(
        cities.items(),
        key=lambda x: x[1],
        reverse=True
    )

    return [
        {
            "city": city,
            "count": count
        }
        for city, count in sorted_cities[:limit]
    ]


# =========================================================
# DEVICE DISTRIBUTION
# =========================================================

def get_device_distribution(db: Session):
    audience_records = db.query(Audience).all()

    total = len(audience_records)

    if total == 0:
        return {}

    distribution = {}

    for record in audience_records:
        device = record.device_type

        distribution[device] = (
            distribution.get(device, 0) + 1
        )

    return {
        device: round(
            (count / total) * 100,
            2
        )
        for device, count in distribution.items()
    }


# =========================================================
# AUDIENCE ANALYTICS REPORT
# =========================================================

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

    top_country = (
        top_countries[0]["country"]
        if top_countries
        else None
    )

    top_city = (
        top_cities[0]["city"]
        if top_cities
        else None
    )

    top_device = None

    if device_distribution:
        top_device = max(
            device_distribution,
            key=device_distribution.get
        )

    return {
        "total_followers": total_followers,
        "total_reach": total_reach,
        "total_impressions": total_impressions,
        "gender_distribution": gender_distribution,
        "age_distribution": age_distribution,
        "top_countries": top_countries,
        "top_cities": top_cities,
        "device_usage": device_distribution,
        "top_country": top_country,
        "top_city": top_city,
        "top_device": top_device
    }


# =========================================================
# GROWTH TREND
# =========================================================

def get_growth_trend(db: Session):

    records = (
        db.query(Growth)
        .order_by(Growth.date.asc())
        .all()
    )

    results = []

    previous_followers = None

    for record in records:

        daily_growth = 0
        growth_percentage = 0

        if previous_followers is not None:
            daily_growth = (
                record.followers
                - previous_followers
            )

            if previous_followers > 0:
                growth_percentage = (
                    daily_growth
                    / previous_followers
                ) * 100

        results.append({
            "date": record.date,
            "followers": record.followers,
            "daily_growth": daily_growth,
            "growth_percentage": round(
                growth_percentage,
                2
            )
        })

        previous_followers = record.followers

    return results[-30:]


# =========================================================
# AUDIENCE TRENDS
# =========================================================

def get_audience_trends(db: Session):

    records = (
        db.query(Growth)
        .order_by(Growth.date.asc())
        .all()
    )

    results = []

    for record in records[-30:]:

        results.append({
            "date": record.date,
            "followers": record.followers,
            "reach": record.reach
        })

    return results