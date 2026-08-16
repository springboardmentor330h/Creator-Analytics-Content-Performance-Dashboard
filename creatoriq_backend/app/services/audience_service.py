from typing import Any, Dict, List, Optional
from sqlalchemy import Select, select
from sqlalchemy.orm import Session

from app.models.audience import Audience
from app.models.growth import Growth
from app.models.user import User
from app.schemas.audience import AudienceCreate, AudienceUpdate
from app.schemas.growth import GrowthCreate, GrowthUpdate


def _apply_scope(stmt: Select[Any], model: Any, user: User) -> Select[Any]:
    role = user.role.lower() if user.role else ''
    if role in {'administrator', 'admin', 'marketing team', 'marketing'}:
        return stmt
    if role == 'creator':
        return stmt.where(model.creator_id == user.id)
    if role == 'agency':
        assigned_ids = [creator.id for creator in (user.assigned_creators or [])]
        if not assigned_ids:
            return stmt.where(model.creator_id == user.id)
        return stmt.where(model.creator_id.in_(assigned_ids))
    return stmt.where(model.creator_id == user.id)


def can_view_audience(user: User, audience: Audience) -> bool:
    role = user.role.lower() if user.role else ''
    if role in {'administrator', 'admin', 'marketing team', 'marketing'}:
        return True
    if audience.creator_id == user.id:
        return True
    if role == 'agency':
        assigned_ids = {creator.id for creator in (user.assigned_creators or [])}
        return audience.creator_id in assigned_ids
    return False


def can_modify_audience(user: User, audience: Audience) -> bool:
    role = user.role.lower() if user.role else ''
    if role in {'administrator', 'admin'}:
        return True
    if role in {'creator', 'agency', 'marketing team', 'marketing'}:
        if audience.creator_id == user.id or role in {'administrator', 'admin', 'agency'}:
            return True
    return audience.creator_id == user.id


def create_audience(db: Session, user: User, payload: AudienceCreate) -> Audience:
    creator_id = payload.creator_id if payload.creator_id is not None else user.id
    if db.get(User, creator_id) is None:
        creator_id = user.id

    audience = Audience(
        creator_id=creator_id,
        age_group=payload.age_group,
        gender=payload.gender,
        country=payload.country,
        city=payload.city,
        device_type=payload.device_type,
        active_hour=payload.active_hour,
        followers=payload.followers,
        impressions=payload.impressions,
        reach=payload.reach,
    )
    db.add(audience)
    db.commit()
    db.refresh(audience)
    return audience


def get_audience_list(db: Session, user: User) -> List[Audience]:
    stmt = _apply_scope(select(Audience), Audience, user)
    return list(db.scalars(stmt).all())


def get_audience_by_id(db: Session, audience_id: int) -> Optional[Audience]:
    return db.get(Audience, audience_id)


def update_audience(db: Session, audience: Audience, payload: AudienceUpdate) -> Audience:
    update_data = payload.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        if value is not None:
            setattr(audience, key, value)
    db.commit()
    db.refresh(audience)
    return audience


def delete_audience(db: Session, audience: Audience) -> None:
    db.delete(audience)
    db.commit()


def create_growth(db: Session, user: User, payload: GrowthCreate) -> Growth:
    creator_id = payload.creator_id if payload.creator_id is not None else user.id
    if db.get(User, creator_id) is None:
        creator_id = user.id

    growth = Growth(
        creator_id=creator_id,
        date=payload.date,
        followers=payload.followers,
        reach=payload.reach,
        engagement_rate=payload.engagement_rate,
    )
    db.add(growth)
    db.commit()
    db.refresh(growth)
    return growth


def get_growth_by_id(db: Session, growth_id: int) -> Optional[Growth]:
    return db.get(Growth, growth_id)


def update_growth(db: Session, growth: Growth, payload: GrowthUpdate) -> Growth:
    update_data = payload.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        if value is not None:
            setattr(growth, key, value)
    db.commit()
    db.refresh(growth)
    return growth


def delete_growth(db: Session, growth: Growth) -> None:
    db.delete(growth)
    db.commit()


def get_audience_analytics(db: Session, user: User) -> Dict[str, Any]:
    stmt = _apply_scope(select(Audience), Audience, user)
    records = list(db.scalars(stmt).all())

    if not records:
        return {
            'total_followers': 0,
            'total_reach': 0,
            'total_impressions': 0,
            'gender_distribution': {},
            'age_distribution': {},
            'top_countries': [],
            'top_cities': [],
            'device_distribution': {},
        }

    total_followers = sum(r.followers for r in records)
    total_reach = sum(r.reach for r in records)
    total_impressions = sum(r.impressions for r in records)

    # Aggregations by followers (or record count if followers sum is 0)
    gender_map: Dict[str, float] = {}
    age_map: Dict[str, float] = {}
    country_map: Dict[str, int] = {}
    city_map: Dict[str, int] = {}
    device_map: Dict[str, float] = {}

    for r in records:
        weight = r.followers if total_followers > 0 else 1

        gender_map[r.gender] = gender_map.get(r.gender, 0.0) + weight
        age_map[r.age_group] = age_map.get(r.age_group, 0.0) + weight
        country_map[r.country] = country_map.get(r.country, 0) + weight
        city_map[r.city] = city_map.get(r.city, 0) + weight
        device_map[r.device_type] = device_map.get(r.device_type, 0.0) + weight

    denom = total_followers if total_followers > 0 else len(records)

    gender_dist = {g: round((val / denom) * 100, 2) for g, val in gender_map.items()}
    age_dist = {a: round((val / denom) * 100, 2) for a, val in age_map.items()}
    device_dist = {d: round((val / denom) * 100, 2) for d, val in device_map.items()}

    sorted_countries = sorted(country_map.keys(), key=lambda c: country_map[c], reverse=True)
    sorted_cities = sorted(city_map.keys(), key=lambda c: city_map[c], reverse=True)

    return {
        'total_followers': total_followers,
        'total_reach': total_reach,
        'total_impressions': total_impressions,
        'gender_distribution': gender_dist,
        'age_distribution': age_dist,
        'top_countries': sorted_countries,
        'top_cities': sorted_cities,
        'device_distribution': device_dist,
    }


def get_growth_analytics(db: Session, user: User) -> List[Dict[str, Any]]:
    stmt = _apply_scope(select(Growth), Growth, user).order_by(Growth.date.desc()).limit(30)
    records = list(db.scalars(stmt).all())
    records.reverse()  # Chronological order ascending by date

    if not records:
        return []

    result = []
    for i, r in enumerate(records):
        if i == 0:
            daily_growth = 0
            growth_pct = 0.0
        else:
            prev_followers = records[i - 1].followers
            daily_growth = r.followers - prev_followers
            if prev_followers > 0:
                growth_pct = round(((r.followers - prev_followers) / prev_followers) * 100, 2)
            else:
                growth_pct = 0.0

        result.append({
            'date': str(r.date),
            'followers': r.followers,
            'daily_growth': daily_growth,
            'growth_percentage': growth_pct,
        })

    return result


def get_audience_trends(db: Session, user: User) -> List[Dict[str, Any]]:
    stmt = _apply_scope(select(Growth), Growth, user).order_by(Growth.date.desc()).limit(30)
    records = list(db.scalars(stmt).all())
    records.reverse()  # Chronological order ascending by date

    return [
        {
            'date': str(r.date),
            'followers': r.followers,
            'reach': r.reach,
        }
        for r in records
    ]
