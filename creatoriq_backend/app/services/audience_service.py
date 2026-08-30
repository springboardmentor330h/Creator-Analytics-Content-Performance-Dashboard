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

        if value:

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


# ============================================================
# TOP VALUES
# ============================================================

def get_top_values(
    records,
    field_name,
    limit=3
):

    if not records:
        return []

    counts = {}

    for record in records:

        value = getattr(
            record,
            field_name
        )

        if value:

            counts[value] = (
                counts.get(value, 0) + 1
            )

    sorted_values = sorted(
        counts.items(),
        key=lambda item: item[1],
        reverse=True
    )

    return [
        {
            field_name: value,
            "count": count
        }
        for value, count
        in sorted_values[:limit]
    ]


def get_top_countries(records):

    return get_top_values(
        records,
        "country",
        3
    )


def get_top_cities(records):

    return get_top_values(
        records,
        "city",
        3
    )


def get_top_device(records):

    top_devices = get_top_values(
        records,
        "device_type",
        1
    )

    if not top_devices:
        return None

    return top_devices[0]["device_type"]


# ============================================================
# AUDIENCE REPORT
# ============================================================

def get_audience_report(db: Session, creator_id: int | None = None):
    """
    creator_id is optional so the existing global /analytics/audience
    endpoint keeps working unchanged; when supplied (e.g. from the
    reporting service) results are scoped to that creator only.
    """

    query = db.query(Audience)
    if creator_id is not None:
        query = query.filter(Audience.creator_id == creator_id)
    records = query.all()

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

        "top_countries":
            get_top_countries(records),

        "top_cities":
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

def get_growth_report(db: Session, creator_id: int | None = None):
    """
    creator_id is optional so the existing global /analytics/growth
    endpoint keeps working unchanged; when supplied (e.g. from the
    reporting service) results are scoped to that creator only.
    """

    # Fetch the most recent 30 records (newest first), then reverse
    # to chronological order for the response. Ordering ascending
    # with a plain limit would return the OLDEST 30 records instead
    # once more than 30 rows exist — the wrong end of the timeline
    # for a "last 30 days" report.
    growth_query = db.query(Growth)
    if creator_id is not None:
        growth_query = growth_query.filter(Growth.creator_id == creator_id)

    growth_records = (
        growth_query
        .order_by(Growth.date.desc())
        .limit(30)
        .all()
    )

    growth_records = list(reversed(growth_records))

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

def get_audience_trends(
    db: Session,
    creator_id: int | None = None,
):
    query = db.query(Growth)

    if creator_id is not None:
        query = query.filter(
            Growth.creator_id == creator_id
        )

    growth_records = (
        query
        .order_by(Growth.date.desc())
        .limit(30)
        .all()
    )

    growth_records = list(
        reversed(growth_records)
    )

    result = []

    for record in growth_records:
        result.append({
            "date": record.date.isoformat(),
            "followers": record.followers or 0,
            "reach": record.reach or 0,
        })

    return result