from sqlalchemy.orm import Session

from app.models.growth import Growth


def get_growth_history(db: Session, creator_id: int, platform: str = None):
    query = db.query(Growth).filter(Growth.creator_id == creator_id)

    if platform:
        query = query.filter(Growth.platform == platform)

    return query.order_by(Growth.record_date.asc()).all()


def get_growth_trend(db: Session, creator_id: int, platform: str = None):
    """Net follower change, growth rate, and a day-by-day series for charting."""
    records = get_growth_history(db, creator_id, platform)

    if not records:
        return {
            "creator_id": creator_id,
            "platform": platform,
            "starting_followers": 0,
            "current_followers": 0,
            "net_change": 0,
            "growth_rate_percent": 0,
            "series": [],
        }

    starting = records[0].follower_count
    current = records[-1].follower_count
    net_change = current - starting

    growth_rate = 0
    if starting > 0:
        growth_rate = round((net_change / starting) * 100, 2)

    series = [
        {
            "date": r.record_date.isoformat(),
            "follower_count": r.follower_count,
            "new_followers": r.new_followers,
            "unfollows": r.unfollows,
        }
        for r in records
    ]

    return {
        "creator_id": creator_id,
        "platform": platform,
        "starting_followers": starting,
        "current_followers": current,
        "net_change": net_change,
        "growth_rate_percent": growth_rate,
        "series": series,
    }


def get_platform_growth_comparison(db: Session, creator_id: int):
    """Growth trend broken out per platform, for the platform-comparison view."""
    platforms = (
        db.query(Growth.platform)
        .filter(Growth.creator_id == creator_id)
        .distinct()
        .all()
    )

    return [
        get_growth_trend(db, creator_id, platform=row[0])
        for row in platforms
    ]
