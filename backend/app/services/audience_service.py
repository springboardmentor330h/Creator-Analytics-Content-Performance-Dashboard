"""
Audience service — demographics aggregation and growth-rate math.

GROWTH RATE FORMULA:
    (followers_end - followers_start) / followers_start * 100
    measured over the requested window (default: all recorded data).

WHY guard against followers_start == 0?
A creator's very first tracked data point might legitimately be 0
followers (brand new channel). Dividing by zero would crash the
request — we treat that as "can't compute a rate yet" and return 0.0
rather than an error, since it's a normal early state, not a bug.
"""
import uuid
from datetime import date, timedelta
from typing import List, Optional
from sqlalchemy.orm import Session

from app.models.audience import AudienceDemographic, AudienceGrowth
from app.models.content import Platform
from app.schemas.audience import AudienceDemographicCreate, AudienceGrowthCreate


# ---------- Demographics ----------

def create_demographic(
    db: Session, creator_id: uuid.UUID, data: AudienceDemographicCreate
) -> AudienceDemographic:
    record = AudienceDemographic(creator_id=creator_id, **data.model_dump())
    db.add(record)
    db.commit()
    db.refresh(record)
    return record


def list_demographics(
    db: Session, creator_id: uuid.UUID, platform: Optional[Platform] = None
) -> List[AudienceDemographic]:
    query = db.query(AudienceDemographic).filter(AudienceDemographic.creator_id == creator_id)
    if platform:
        query = query.filter(AudienceDemographic.platform == platform)
    return query.order_by(AudienceDemographic.snapshot_date.desc()).all()


def get_age_breakdown(db: Session, creator_id: uuid.UUID) -> List[dict]:
    """
    Averages percentage per age group across all recorded snapshots/countries.
    Using the LATEST snapshot_date only would be more precise, but averaging
    across recent records smooths out noise from a single platform's report.
    """
    records = list_demographics(db, creator_id)
    if not records:
        return []

    by_group: dict[str, list[float]] = {}
    for r in records:
        by_group.setdefault(r.age_group.value, []).append(r.percentage)

    return [
        {"label": group, "percentage": round(sum(vals) / len(vals), 2)}
        for group, vals in sorted(by_group.items())
    ]


def get_gender_breakdown(db: Session, creator_id: uuid.UUID) -> List[dict]:
    records = list_demographics(db, creator_id)
    if not records:
        return []

    by_gender: dict[str, list[float]] = {}
    for r in records:
        by_gender.setdefault(r.gender.value, []).append(r.percentage)

    return [
        {"label": gender, "percentage": round(sum(vals) / len(vals), 2)}
        for gender, vals in sorted(by_gender.items())
    ]


def get_geographic_breakdown(db: Session, creator_id: uuid.UUID) -> List[dict]:
    records = list_demographics(db, creator_id)
    if not records:
        return []

    by_country: dict[str, list[float]] = {}
    for r in records:
        by_country.setdefault(r.country, []).append(r.percentage)

    breakdown = [
        {"country": country, "percentage": round(sum(vals) / len(vals), 2)}
        for country, vals in by_country.items()
    ]
    return sorted(breakdown, key=lambda x: x["percentage"], reverse=True)


# ---------- Growth ----------

def create_growth_record(
    db: Session, creator_id: uuid.UUID, data: AudienceGrowthCreate
) -> AudienceGrowth:
    record = AudienceGrowth(creator_id=creator_id, **data.model_dump())
    db.add(record)
    db.commit()
    db.refresh(record)
    return record


def get_growth_trend(
    db: Session,
    creator_id: uuid.UUID,
    platform: Optional[Platform] = None,
    days: Optional[int] = None,
) -> List[AudienceGrowth]:
    query = db.query(AudienceGrowth).filter(AudienceGrowth.creator_id == creator_id)
    if platform:
        query = query.filter(AudienceGrowth.platform == platform)
    if days:
        cutoff = date.today() - timedelta(days=days)
        query = query.filter(AudienceGrowth.record_date >= cutoff)
    return query.order_by(AudienceGrowth.record_date.asc()).all()


def calculate_growth_rate(start_count: int, end_count: int) -> float:
    if start_count == 0:
        return 0.0
    return round(((end_count - start_count) / start_count) * 100, 2)


def get_current_followers(
    db: Session, creator_id: uuid.UUID, platform: Platform
) -> Optional[int]:
    """
    The most recently recorded follower count for a platform, regardless
    of any day-window filter. "Current followers" and "growth rate over
    the last N days" are different questions — a creator's only data
    point being 6 months old shouldn't make their current follower count
    report as zero just because it falls outside a 30-day growth window.
    """
    latest = (
        db.query(AudienceGrowth)
        .filter(AudienceGrowth.creator_id == creator_id, AudienceGrowth.platform == platform)
        .order_by(AudienceGrowth.record_date.desc())
        .first()
    )
    return latest.follower_count if latest else None


def get_growth_summary(
    db: Session, creator_id: uuid.UUID, platform: Platform, days: int = 30
) -> Optional[dict]:
    current_followers = get_current_followers(db, creator_id, platform)
    if current_followers is None:
        return None

    records = get_growth_trend(db, creator_id, platform, days)

    if len(records) >= 1:
        start_count = records[0].follower_count
        growth_rate = calculate_growth_rate(start_count, current_followers)
        followers_gained = current_followers - start_count
    else:
        # We have a follower count, just none within the requested window.
        growth_rate = 0.0
        followers_gained = 0

    return {
        "platform": platform,
        "current_followers": current_followers,
        "followers_gained": followers_gained,
        "growth_rate_percent": growth_rate,
        "period_days": days,
    }


def get_audience_kpi_summary(db: Session, creator_id: uuid.UUID) -> dict:
    """
    Cross-platform summary: total current followers (latest record per
    platform, summed), overall growth rate, and top demographic slices.
    """
    all_growth = db.query(AudienceGrowth).filter(AudienceGrowth.creator_id == creator_id).all()

    if not all_growth:
        return {
            "total_followers": 0,
            "total_growth_rate_percent": 0.0,
            "top_country": None,
            "top_age_group": None,
        }

    # Latest record per platform
    latest_by_platform: dict[Platform, AudienceGrowth] = {}
    earliest_by_platform: dict[Platform, AudienceGrowth] = {}
    for record in all_growth:
        platform = record.platform
        if platform not in latest_by_platform or record.record_date > latest_by_platform[platform].record_date:
            latest_by_platform[platform] = record
        if platform not in earliest_by_platform or record.record_date < earliest_by_platform[platform].record_date:
            earliest_by_platform[platform] = record

    total_followers = sum(r.follower_count for r in latest_by_platform.values())
    total_start = sum(r.follower_count for r in earliest_by_platform.values())
    overall_growth_rate = calculate_growth_rate(total_start, total_followers)

    geo = get_geographic_breakdown(db, creator_id)
    age = get_age_breakdown(db, creator_id)

    top_country = geo[0]["country"] if geo else None
    top_age_group = max(age, key=lambda x: x["percentage"])["label"] if age else None

    return {
        "total_followers": total_followers,
        "total_growth_rate_percent": overall_growth_rate,
        "top_country": top_country,
        "top_age_group": top_age_group,
    }
