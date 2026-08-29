from collections import Counter

from sqlalchemy.orm import Session

from app.models.audience import Audience
from app.models.growth import Growth


# -----------------------------
# Audience query helper
# -----------------------------

def get_audiences(
    db: Session,
    creator_id: int | None = None,
) -> list[Audience]:
    query = db.query(Audience)

    if creator_id is not None:
        query = query.filter(
            Audience.creator_id == creator_id
        )

    return query.all()


# -----------------------------
# Basic audience totals
# -----------------------------

def get_total_followers(
    db: Session,
    creator_id: int | None = None,
) -> int:
    audiences = get_audiences(db, creator_id)

    return sum(
        audience.followers
        for audience in audiences
    )


def get_total_reach(
    db: Session,
    creator_id: int | None = None,
) -> int:
    audiences = get_audiences(db, creator_id)

    return sum(
        audience.reach
        for audience in audiences
    )


def get_total_impressions(
    db: Session,
    creator_id: int | None = None,
) -> int:
    audiences = get_audiences(db, creator_id)

    return sum(
        audience.impressions
        for audience in audiences
    )


# -----------------------------
# Gender distribution
# -----------------------------

def get_gender_distribution(
    db: Session,
    creator_id: int | None = None,
) -> dict:
    audiences = get_audiences(db, creator_id)

    if not audiences:
        return {}

    counts = Counter(
        audience.gender.strip().lower()
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


# -----------------------------
# Age distribution
# -----------------------------

def get_age_distribution(
    db: Session,
    creator_id: int | None = None,
) -> dict:
    audiences = get_audiences(db, creator_id)

    if not audiences:
        return {}

    counts = Counter(
        audience.age_group.strip()
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


# -----------------------------
# Top countries
# -----------------------------

def get_top_countries(
    db: Session,
    creator_id: int | None = None,
    limit: int = 5,
) -> list:
    audiences = get_audiences(db, creator_id)

    counts = Counter(
        audience.country.strip()
        for audience in audiences
    )

    return [
        {
            "country": country,
            "count": count,
        }
        for country, count in counts.most_common(limit)
    ]


# -----------------------------
# Top cities
# -----------------------------

def get_top_cities(
    db: Session,
    creator_id: int | None = None,
    limit: int = 5,
) -> list:
    audiences = get_audiences(db, creator_id)

    counts = Counter(
        audience.city.strip()
        for audience in audiences
    )

    return [
        {
            "city": city,
            "count": count,
        }
        for city, count in counts.most_common(limit)
    ]


# -----------------------------
# Device distribution
# -----------------------------

def get_device_distribution(
    db: Session,
    creator_id: int | None = None,
) -> dict:
    audiences = get_audiences(db, creator_id)

    if not audiences:
        return {}

    counts = Counter(
        audience.device_type.strip()
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
# Active hours
# -----------------------------

def get_active_hours(
    db: Session,
    creator_id: int | None = None,
) -> list:
    audiences = get_audiences(db, creator_id)

    if not audiences:
        return []

    counts = Counter(
        audience.active_hour
        for audience in audiences
    )

    return [
        {
            "hour": hour,
            "count": count,
        }
        for hour, count in sorted(
            counts.items()
        )
    ]


# -----------------------------
# Audience behavior summary
# -----------------------------

def get_audience_behavior(
    db: Session,
    creator_id: int | None = None,
) -> dict:
    audiences = get_audiences(db, creator_id)

    if not audiences:
        return {
            "peak_active_hour": None,
            "peak_active_hour_count": 0,
            "top_device": None,
            "top_country": None,
            "top_city": None,
        }

    hour_counts = Counter(
        audience.active_hour
        for audience in audiences
    )

    device_counts = Counter(
        audience.device_type.strip()
        for audience in audiences
    )

    country_counts = Counter(
        audience.country.strip()
        for audience in audiences
    )

    city_counts = Counter(
        audience.city.strip()
        for audience in audiences
    )

    peak_hour, peak_hour_count = (
        hour_counts.most_common(1)[0]
    )

    top_device = (
        device_counts.most_common(1)[0][0]
        if device_counts
        else None
    )

    top_country = (
        country_counts.most_common(1)[0][0]
        if country_counts
        else None
    )

    top_city = (
        city_counts.most_common(1)[0][0]
        if city_counts
        else None
    )

    return {
        "peak_active_hour": peak_hour,
        "peak_active_hour_count": peak_hour_count,
        "top_device": top_device,
        "top_country": top_country,
        "top_city": top_city,
    }


# -----------------------------
# Growth trend
# -----------------------------

def get_growth_trend(
    db: Session,
    creator_id: int,
    limit: int = 30,
) -> list:
    growth_records = (
        db.query(Growth)
        .filter(
            Growth.creator_id == creator_id
        )
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
            "reach": record.reach,
            "engagement_rate": record.engagement_rate,
        })

        previous_followers = record.followers

    return results


# -----------------------------
# Audience trends
# -----------------------------

def get_audience_trends(
    db: Session,
    creator_id: int,
    limit: int = 30,
) -> list:
    growth_records = (
        db.query(Growth)
        .filter(
            Growth.creator_id == creator_id
        )
        .order_by(Growth.date.asc())
        .limit(limit)
        .all()
    )

    return [
        {
            "date": record.date,
            "followers": record.followers,
            "reach": record.reach,
            "engagement_rate": record.engagement_rate,
        }
        for record in growth_records
    ]
































# from collections import Counter

# from sqlalchemy.orm import Session

# from app.models.audience import Audience
# from app.models.growth import Growth


# # -----------------------------
# # Basic audience totals
# # -----------------------------

# def get_total_followers(db: Session) -> int:
#     audiences = db.query(Audience).all()

#     return sum(
#         audience.followers
#         for audience in audiences
#     )


# def get_total_reach(db: Session) -> int:
#     audiences = db.query(Audience).all()

#     return sum(
#         audience.reach
#         for audience in audiences
#     )


# def get_total_impressions(db: Session) -> int:
#     audiences = db.query(Audience).all()

#     return sum(
#         audience.impressions
#         for audience in audiences
#     )


# # -----------------------------
# # Audience distributions
# # -----------------------------

# def get_gender_distribution(db: Session) -> dict:
#     audiences = db.query(Audience).all()

#     if not audiences:
#         return {}

#     counts = Counter(
#         audience.gender.lower()
#         for audience in audiences
#     )

#     total = len(audiences)

#     return {
#         gender: round(
#             (count / total) * 100,
#             2,
#         )
#         for gender, count in counts.items()
#     }


# def get_age_distribution(db: Session) -> dict:
#     audiences = db.query(Audience).all()

#     if not audiences:
#         return {}

#     counts = Counter(
#         audience.age_group
#         for audience in audiences
#     )

#     total = len(audiences)

#     return {
#         age_group: round(
#             (count / total) * 100,
#             2,
#         )
#         for age_group, count in counts.items()
#     }


# def get_top_countries(
#     db: Session,
#     limit: int = 5,
# ) -> list:
#     audiences = db.query(Audience).all()

#     counts = Counter(
#         audience.country
#         for audience in audiences
#     )

#     return [
#         {
#             "country": country,
#             "count": count,
#         }
#         for country, count in counts.most_common(limit)
#     ]


# def get_top_cities(
#     db: Session,
#     limit: int = 5,
# ) -> list:
#     audiences = db.query(Audience).all()

#     counts = Counter(
#         audience.city
#         for audience in audiences
#     )

#     return [
#         {
#             "city": city,
#             "count": count,
#         }
#         for city, count in counts.most_common(limit)
#     ]


# def get_device_distribution(db: Session) -> dict:
#     audiences = db.query(Audience).all()

#     if not audiences:
#         return {}

#     counts = Counter(
#         audience.device_type
#         for audience in audiences
#     )

#     total = len(audiences)

#     return {
#         device: round(
#             (count / total) * 100,
#             2,
#         )
#         for device, count in counts.items()
#     }


# # -----------------------------
# # Growth trend generation
# # -----------------------------

# def get_growth_trend(
#     db: Session,
#     limit: int = 30,
# ) -> list:
#     growth_records = (
#         db.query(Growth)
#         .order_by(Growth.date.asc())
#         .limit(limit)
#         .all()
#     )

#     results = []

#     previous_followers = None

#     for record in growth_records:

#         if previous_followers is None:
#             daily_growth = 0
#             growth_percentage = 0
#         else:
#             daily_growth = (
#                 record.followers
#                 - previous_followers
#             )

#             if previous_followers > 0:
#                 growth_percentage = (
#                     daily_growth
#                     / previous_followers
#                 ) * 100
#             else:
#                 growth_percentage = 0

#         results.append({
#             "date": record.date,
#             "followers": record.followers,
#             "daily_growth": daily_growth,
#             "growth_percentage": round(
#                 growth_percentage,
#                 2,
#             ),
#         })

#         previous_followers = record.followers

#     return results


# # -----------------------------
# # Audience trends
# # -----------------------------

# def get_audience_trends(
#     db: Session,
#     limit: int = 30,
# ) -> list:
#     growth_records = (
#         db.query(Growth)
#         .order_by(Growth.date.asc())
#         .limit(limit)
#         .all()
#     )

#     return [
#         {
#             "date": record.date,
#             "followers": record.followers,
#             "reach": record.reach,
#         }
#         for record in growth_records
#     ]