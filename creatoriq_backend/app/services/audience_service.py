from sqlalchemy.orm import Session

from app.models.audience import Audience
from app.models.growth import Growth


# ============================================================
# AUDIENCE ANALYTICS
# ============================================================

def get_total_followers(records):

    return sum(
        record.followers or 0
        for record in records
    )


def get_total_reach(records):

    return sum(
        record.reach or 0
        for record in records
    )


def get_total_impressions(records):

    return sum(
        record.impressions or 0
        for record in records
    )


def calculate_distribution(records, field_name):

    distribution = {}

    total = len(records)

    if total == 0:
        return distribution

    for record in records:

        value = getattr(record, field_name)

        distribution[value] = (
            distribution.get(value, 0) + 1
        )

    result = {}

    for key, count in distribution.items():

        percentage = (
            count / total
        ) * 100

        result[key] = round(
            percentage,
            2
        )

    return result


def get_top_value(records, field_name):

    if not records:
        return None

    counts = {}

    for record in records:

        value = getattr(record, field_name)

        counts[value] = (
            counts.get(value, 0) + 1
        )

    return max(
        counts,
        key=counts.get
    )


def get_top_countries(records):

    return get_top_value(
        records,
        "country"
    )


def get_top_cities(records):

    return get_top_value(
        records,
        "city"
    )


def get_top_device(records):

    return get_top_value(
        records,
        "device_type"
    )


def get_audience_report(db: Session):

    records = (
        db.query(Audience)
        .all()
    )

    return {

        "total_followers":
            get_total_followers(records),

        "total_reach":
            get_total_reach(records),

        "total_impressions":
            get_total_impressions(records),

        "gender_distribution":
            calculate_distribution(
                records,
                "gender"
            ),

        "age_distribution":
            calculate_distribution(
                records,
                "age_group"
            ),

        "top_country":
            get_top_countries(records),

        "top_city":
            get_top_cities(records),

        "device_usage":
            calculate_distribution(
                records,
                "device_type"
            ),

        "top_device":
            get_top_device(records)
    }


# ============================================================
# GROWTH ANALYTICS
# ============================================================

def get_growth_report(db: Session):

    growth_records = (
        db.query(Growth)
        .order_by(Growth.date.asc())
        .limit(30)
        .all()
    )

    result = []

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

        result.append({

            "date":
                record.date.isoformat(),

            "followers":
                record.followers,

            "daily_growth":
                daily_growth,

            "growth_percentage":
                round(
                    growth_percentage,
                    2
                )
        })

        previous_followers = (
            record.followers
        )

    return result


# ============================================================
# AUDIENCE TRENDS
# ============================================================

def get_audience_trends(db: Session):

    growth_records = (
        db.query(Growth)
        .order_by(Growth.date.asc())
        .limit(30)
        .all()
    )

    result = []

    for record in growth_records:

        result.append({

            "date":
                record.date.isoformat(),

            "followers":
                record.followers,

            "reach":
                record.reach
        })

    return result