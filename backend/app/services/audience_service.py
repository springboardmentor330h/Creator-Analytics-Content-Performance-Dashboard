from typing import List, Dict, Any, Optional

from sqlalchemy import func
from sqlalchemy.orm import Session

from app.models.audience import Audience
from app.models.growth import Growth


# ---------- Totals ----------

def get_total_followers(db: Session, creator_id: Optional[int] = None) -> int:
    query = db.query(func.coalesce(func.sum(Audience.followers), 0))
    if creator_id is not None:
        query = query.filter(Audience.creator_id == creator_id)
    return int(query.scalar())


def get_total_reach(db: Session, creator_id: Optional[int] = None) -> int:
    query = db.query(func.coalesce(func.sum(Audience.reach), 0))
    if creator_id is not None:
        query = query.filter(Audience.creator_id == creator_id)
    return int(query.scalar())


def get_total_impressions(db: Session, creator_id: Optional[int] = None) -> int:
    query = db.query(func.coalesce(func.sum(Audience.impressions), 0))
    if creator_id is not None:
        query = query.filter(Audience.creator_id == creator_id)
    return int(query.scalar())


# ---------- Distributions (percentage of followers by category) ----------

def _distribution_by_followers(db: Session, column, creator_id: Optional[int] = None) -> Dict[str, int]:
    query = db.query(column, func.coalesce(func.sum(Audience.followers), 0))
    if creator_id is not None:
        query = query.filter(Audience.creator_id == creator_id)
    rows = query.group_by(column).all()
    total = sum(count for _, count in rows) or 1
    return {
        str(label): round((count / total) * 100)
        for label, count in rows
        if label is not None
    }


def get_gender_distribution(db: Session, creator_id: Optional[int] = None) -> Dict[str, int]:
    return _distribution_by_followers(db, Audience.gender, creator_id=creator_id)


def get_age_distribution(db: Session, creator_id: Optional[int] = None) -> Dict[str, int]:
    return _distribution_by_followers(db, Audience.age_group, creator_id=creator_id)


def get_device_distribution(db: Session, creator_id: Optional[int] = None) -> Dict[str, int]:
    return _distribution_by_followers(db, Audience.device_type, creator_id=creator_id)


# ---------- Top N rankings ----------

def _top_n_by_followers(db: Session, column, limit: int = 5, creator_id: Optional[int] = None) -> List[Dict[str, Any]]:
    query = db.query(column, func.coalesce(func.sum(Audience.followers), 0).label("followers"))
    if creator_id is not None:
        query = query.filter(Audience.creator_id == creator_id)
    rows = (
        query.group_by(column)
        .order_by(func.sum(Audience.followers).desc())
        .limit(limit)
        .all()
    )
    return [{"name": label, "followers": int(count)} for label, count in rows if label is not None]


def get_top_countries(db: Session, limit: int = 5, creator_id: Optional[int] = None) -> List[Dict[str, Any]]:
    return _top_n_by_followers(db, Audience.country, limit, creator_id=creator_id)


def get_top_cities(db: Session, limit: int = 5, creator_id: Optional[int] = None) -> List[Dict[str, Any]]:
    return _top_n_by_followers(db, Audience.city, limit, creator_id=creator_id)


# ---------- Combined audience report ----------

def get_audience_report(db: Session, creator_id: Optional[int] = None) -> Dict[str, Any]:
    top_countries = get_top_countries(db, limit=1, creator_id=creator_id)
    top_cities = get_top_cities(db, limit=1, creator_id=creator_id)
    device_distribution = get_device_distribution(db, creator_id=creator_id)
    top_device = max(device_distribution, key=device_distribution.get) if device_distribution else None

    return {
        "total_followers": get_total_followers(db, creator_id=creator_id),
        "total_reach": get_total_reach(db, creator_id=creator_id),
        "total_impressions": get_total_impressions(db, creator_id=creator_id),
        "gender_distribution": get_gender_distribution(db, creator_id=creator_id),
        "age_distribution": get_age_distribution(db, creator_id=creator_id),
        "top_country": top_countries[0]["name"] if top_countries else None,
        "top_city": top_cities[0]["name"] if top_cities else None,
        "top_device": top_device,
    }


# ---------- Growth trend generation ----------

def get_growth_report(db: Session, days: int = 30, creator_id: Optional[int] = None) -> List[Dict[str, Any]]:
    """
    Returns up to `days` most recent growth rows in chronological order,
    each annotated with day-over-day follower growth and growth percentage.
    """
    query = db.query(Growth)
    if creator_id is not None:
        query = query.filter(Growth.creator_id == creator_id)
    rows = (
        query.order_by(Growth.date.desc())
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


def get_audience_trends(db: Session, creator_id: Optional[int] = None) -> List[Dict[str, Any]]:
    """Chart-ready date/followers/reach series drawn from the growth table."""
    query = db.query(Growth.date, Growth.followers, Growth.reach)
    if creator_id is not None:
        query = query.filter(Growth.creator_id == creator_id)
    rows = query.order_by(Growth.date.asc()).all()
    return [{"date": d, "followers": followers, "reach": reach} for d, followers, reach in rows]