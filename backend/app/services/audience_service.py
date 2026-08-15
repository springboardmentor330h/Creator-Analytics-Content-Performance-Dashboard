from typing import List, Dict, Any

from sqlalchemy import func
from sqlalchemy.orm import Session

from app.models.audience import Audience
from app.models.growth import Growth


# ---------- Totals ----------

def get_total_followers(db: Session) -> int:
    return int(db.query(func.coalesce(func.sum(Audience.followers), 0)).scalar())


def get_total_reach(db: Session) -> int:
    return int(db.query(func.coalesce(func.sum(Audience.reach), 0)).scalar())


def get_total_impressions(db: Session) -> int:
    return int(db.query(func.coalesce(func.sum(Audience.impressions), 0)).scalar())


# ---------- Distributions (percentage of followers by category) ----------

def _distribution_by_followers(db: Session, column) -> Dict[str, int]:
    rows = (
        db.query(column, func.coalesce(func.sum(Audience.followers), 0))
        .group_by(column)
        .all()
    )
    total = sum(count for _, count in rows) or 1
    return {
        str(label): round((count / total) * 100)
        for label, count in rows
        if label is not None
    }


def get_gender_distribution(db: Session) -> Dict[str, int]:
    return _distribution_by_followers(db, Audience.gender)


def get_age_distribution(db: Session) -> Dict[str, int]:
    return _distribution_by_followers(db, Audience.age_group)


def get_device_distribution(db: Session) -> Dict[str, int]:
    return _distribution_by_followers(db, Audience.device_type)


# ---------- Top N rankings ----------

def _top_n_by_followers(db: Session, column, limit: int = 5) -> List[Dict[str, Any]]:
    rows = (
        db.query(column, func.coalesce(func.sum(Audience.followers), 0).label("followers"))
        .group_by(column)
        .order_by(func.sum(Audience.followers).desc())
        .limit(limit)
        .all()
    )
    return [{"name": label, "followers": int(count)} for label, count in rows if label is not None]


def get_top_countries(db: Session, limit: int = 5) -> List[Dict[str, Any]]:
    return _top_n_by_followers(db, Audience.country, limit)


def get_top_cities(db: Session, limit: int = 5) -> List[Dict[str, Any]]:
    return _top_n_by_followers(db, Audience.city, limit)


# ---------- Combined audience report ----------

def get_audience_report(db: Session) -> Dict[str, Any]:
    top_countries = get_top_countries(db, limit=1)
    top_cities = get_top_cities(db, limit=1)
    device_distribution = get_device_distribution(db)
    top_device = max(device_distribution, key=device_distribution.get) if device_distribution else None

    return {
        "total_followers": get_total_followers(db),
        "total_reach": get_total_reach(db),
        "total_impressions": get_total_impressions(db),
        "gender_distribution": get_gender_distribution(db),
        "age_distribution": get_age_distribution(db),
        "top_country": top_countries[0]["name"] if top_countries else None,
        "top_city": top_cities[0]["name"] if top_cities else None,
        "top_device": top_device,
    }


# ---------- Growth trend generation ----------

def get_growth_report(db: Session, days: int = 30) -> List[Dict[str, Any]]:
    """
    Returns up to `days` most recent growth rows in chronological order,
    each annotated with day-over-day follower growth and growth percentage.
    """
    rows = (
        db.query(Growth)
        .order_by(Growth.date.desc())
        .limit(days)
        .all()
    )
    rows = list(reversed(rows))  # chronological order (oldest first)

    report = []
    previous_followers = None
    for row in rows:
        if previous_followers is None:
            daily_growth = 0
            growth_percentage = 0.0
        else:
            daily_growth = row.followers - previous_followers
            growth_percentage = (
                round((daily_growth / previous_followers) * 100, 2)
                if previous_followers
                else 0.0
            )

        report.append({
            "date": row.date,
            "followers": row.followers,
            "daily_growth": daily_growth,
            "growth_percentage": growth_percentage,
        })
        previous_followers = row.followers

    return report


def get_audience_trends(db: Session) -> List[Dict[str, Any]]:
    """Chart-ready date/followers/reach series drawn from the growth table."""
    rows = (
        db.query(Growth.date, Growth.followers, Growth.reach)
        .order_by(Growth.date.asc())
        .all()
    )
    return [{"date": d, "followers": followers, "reach": reach} for d, followers, reach in rows]