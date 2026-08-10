from datetime import date
from math import ceil
from typing import Any, Dict, List, Optional, Sequence

from sqlalchemy import Select, asc, desc, func, or_, select
from sqlalchemy.orm import Session

from app.models.content import CONTENT_TYPES, PLATFORMS, Content
from app.models.user import User
from app.schemas.content import ContentCreate, ContentUpdate

SORTABLE_FIELDS = {
    'views': Content.views,
    'likes': Content.likes,
    'comments': Content.comments,
    'shares': Content.shares,
    'saves': Content.saves,
    'reach': Content.reach,
    'watch_time': Content.watch_time,
    'engagement_rate': Content.engagement_rate,
    'published_at': Content.published_at,
}

MAX_COMPARE_IDS = 10
DEFAULT_PAGE_SIZE = 10
MAX_PAGE_SIZE = 100


def calculate_engagement_rate(likes: int, comments: int, shares: int, saves: int, reach: int) -> float:
    if reach <= 0:
        return 0.0
    return round(((likes + comments + shares + saves) / reach) * 100, 2)


def can_view_content(user: User, content: Content) -> bool:
    if user.role == 'Administrator':
        return True
    if user.role == 'Marketing Team':
        return True
    if content.creator_id == user.id:
        return True
    if user.role == 'Agency':
        assigned_ids = {creator.id for creator in (user.assigned_creators or [])}
        return content.creator_id in assigned_ids
    return False


def can_modify_content(user: User, content: Content) -> bool:
    if user.role == 'Administrator':
        return True
    if user.role == 'Creator' and content.creator_id == user.id:
        return True
    return False


def can_create_content(user: User) -> bool:
    return user.role in {'Creator', 'Administrator'}


def _apply_scope(stmt: Select[Any], user: User) -> Select[Any]:
    if user.role in {'Administrator', 'Marketing Team'}:
        return stmt
    if user.role == 'Creator':
        return stmt.where(Content.creator_id == user.id)
    if user.role == 'Agency':
        assigned_ids = [creator.id for creator in (user.assigned_creators or [])]
        if not assigned_ids:
            return stmt.where(Content.creator_id == -1)
        return stmt.where(Content.creator_id.in_(assigned_ids))
    return stmt.where(Content.creator_id == -1)


def _apply_filters(
    stmt: Select[Any],
    *,
    platform: Optional[str] = None,
    content_type: Optional[str] = None,
    search: Optional[str] = None,
    published_from: Optional[date] = None,
    published_to: Optional[date] = None,
) -> Select[Any]:
    if platform:
        stmt = stmt.where(Content.platform == platform)
    if content_type:
        stmt = stmt.where(Content.content_type == content_type)
    if search:
        term = f'%{search.strip()}%'
        if term != '%%':
            stmt = stmt.where(
                or_(
                    Content.title.ilike(term),
                    Content.platform.ilike(term),
                    Content.content_type.ilike(term),
                )
            )
    if published_from:
        stmt = stmt.where(Content.published_at >= published_from)
    if published_to:
        stmt = stmt.where(Content.published_at <= published_to)
    return stmt


def create_content(db: Session, creator: User, payload: ContentCreate) -> Content:
    if not can_create_content(creator):
        raise PermissionError('You do not have permission to create content')
    if payload.platform not in PLATFORMS:
        raise ValueError('Invalid platform')
    if payload.content_type not in CONTENT_TYPES:
        raise ValueError('Invalid content type')

    engagement_rate = calculate_engagement_rate(
        payload.likes, payload.comments, payload.shares, payload.saves, payload.reach
    )
    content = Content(
        creator_id=creator.id,
        platform=payload.platform,
        content_id=f'{creator.id}-{payload.title[:40]}'.replace(' ', '-').lower(),
        title=payload.title,
        content_type=payload.content_type,
        published_at=payload.published_at,
        views=payload.views,
        likes=payload.likes,
        comments=payload.comments,
        shares=payload.shares,
        saves=payload.saves,
        watch_time=payload.watch_time,
        reach=payload.reach,
        engagement_rate=engagement_rate,
    )
    db.add(content)
    db.commit()
    db.refresh(content)
    return content


def get_content_by_id(db: Session, content_id: int) -> Optional[Content]:
    return db.get(Content, content_id)


def get_content_list(
    db: Session,
    user: User,
    page: int = 1,
    page_size: int = DEFAULT_PAGE_SIZE,
    platform: Optional[str] = None,
    content_type: Optional[str] = None,
    search: Optional[str] = None,
    sort_by: str = 'views',
    sort_order: str = 'desc',
    published_from: Optional[date] = None,
    published_to: Optional[date] = None,
) -> Dict[str, Any]:
    page = max(page, 1)
    page_size = min(max(page_size, 1), MAX_PAGE_SIZE)
    if sort_by not in SORTABLE_FIELDS:
        raise ValueError(f'Invalid sort_by. Allowed: {", ".join(sorted(SORTABLE_FIELDS))}')
    if sort_order not in {'asc', 'desc'}:
        raise ValueError('Invalid sort_order. Allowed: asc, desc')
    if platform and platform not in PLATFORMS:
        raise ValueError('Invalid platform filter')
    if content_type and content_type not in CONTENT_TYPES:
        raise ValueError('Invalid content_type filter')

    stmt = _apply_scope(select(Content), user)
    stmt = _apply_filters(
        stmt,
        platform=platform,
        content_type=content_type,
        search=search,
        published_from=published_from,
        published_to=published_to,
    )

    count_stmt = select(func.count()).select_from(stmt.order_by(None).subquery())
    total = db.scalar(count_stmt) or 0

    order_column = SORTABLE_FIELDS[sort_by]
    order = desc(order_column) if sort_order == 'desc' else asc(order_column)
    items = db.scalars(stmt.order_by(order).offset((page - 1) * page_size).limit(page_size)).all()

    return {
        'items': items,
        'page': page,
        'page_size': page_size,
        'total': total,
        'total_pages': ceil(total / page_size) if total else 0,
    }


def update_content(db: Session, content: Content, payload: ContentUpdate) -> Content:
    data = payload.model_dump(exclude_unset=True)
    if 'platform' in data and data['platform'] not in PLATFORMS:
        raise ValueError('Invalid platform')
    if 'content_type' in data and data['content_type'] not in CONTENT_TYPES:
        raise ValueError('Invalid content type')

    for field, value in data.items():
        setattr(content, field, value)

    content.engagement_rate = calculate_engagement_rate(
        content.likes, content.comments, content.shares, content.saves, content.reach
    )
    db.commit()
    db.refresh(content)
    return content


def delete_content(db: Session, content: Content) -> None:
    db.delete(content)
    db.commit()


def get_summary_metrics(db: Session, user: User) -> Dict[str, Any]:
    scoped = _apply_scope(select(Content.id), user).subquery()
    summary = db.execute(
        select(
            func.count(Content.id),
            func.coalesce(func.sum(Content.views), 0),
            func.coalesce(func.sum(Content.likes), 0),
            func.coalesce(func.sum(Content.comments), 0),
            func.coalesce(func.sum(Content.shares), 0),
            func.coalesce(func.sum(Content.saves), 0),
            func.coalesce(func.sum(Content.reach), 0),
            func.coalesce(func.sum(Content.watch_time), 0),
            func.coalesce(func.avg(Content.engagement_rate), 0),
        ).where(Content.id.in_(select(scoped.c.id)))
    ).one()

    total_views = int(summary[1] or 0)
    total_likes = int(summary[2] or 0)
    total_comments = int(summary[3] or 0)
    total_shares = int(summary[4] or 0)
    total_saves = int(summary[5] or 0)
    total_reach = int(summary[6] or 0)
    total_watch_time = int(summary[7] or 0)
    average_engagement_rate = round(float(summary[8] or 0), 2)
    engagement = total_likes + total_comments + total_shares + total_saves

    return {
        'content_count': int(summary[0] or 0),
        'total_views': total_views,
        'total_likes': total_likes,
        'total_comments': total_comments,
        'total_shares': total_shares,
        'total_saves': total_saves,
        'total_reach': total_reach,
        'total_watch_time': total_watch_time,
        'average_engagement_rate': average_engagement_rate,
        'views': total_views,
        'likes': total_likes,
        'comments': total_comments,
        'shares': total_shares,
        'saves': total_saves,
        'reach': total_reach,
        'watch_time': total_watch_time,
        'engagement': engagement,
    }


def get_top_performing_content(db: Session, user: User, limit: int = 5) -> List[Dict[str, Any]]:
    limit = min(max(limit, 1), 50)
    stmt = _apply_scope(select(Content), user).order_by(desc(Content.engagement_rate), desc(Content.views)).limit(limit)
    records = db.scalars(stmt).all()
    return [
        {
            'id': item.id,
            'title': item.title,
            'platform': item.platform,
            'content_type': item.content_type,
            'engagement_rate': item.engagement_rate,
            'views': item.views,
            'likes': item.likes,
            'comments': item.comments,
            'shares': item.shares,
            'saves': item.saves,
            'reach': item.reach,
        }
        for item in records
    ]


def get_trend_data(db: Session, user: User) -> List[Dict[str, Any]]:
    stmt = select(
        Content.published_at,
        func.coalesce(func.sum(Content.views), 0),
        func.coalesce(func.sum(Content.likes), 0),
        func.coalesce(func.sum(Content.comments), 0),
        func.coalesce(func.sum(Content.shares), 0),
        func.coalesce(func.sum(Content.reach), 0),
        func.coalesce(func.avg(Content.engagement_rate), 0),
    ).group_by(Content.published_at).order_by(Content.published_at)
    stmt = _apply_scope(stmt, user)
    rows = db.execute(stmt).all()
    return [
        {
            'date': row[0].isoformat(),
            'views': int(row[1] or 0),
            'likes': int(row[2] or 0),
            'comments': int(row[3] or 0),
            'shares': int(row[4] or 0),
            'reach': int(row[5] or 0),
            'engagement_rate': round(float(row[6] or 0), 2),
        }
        for row in rows
    ]


def compare_content_records(db: Session, user: User, ids: Sequence[int]) -> List[Dict[str, Any]]:
    unique_ids = list(dict.fromkeys(ids))
    if not unique_ids:
        raise ValueError('No content ids provided')
    if len(unique_ids) > MAX_COMPARE_IDS:
        raise ValueError(f'You can compare at most {MAX_COMPARE_IDS} content items')
    if any(not isinstance(item, int) or item <= 0 for item in unique_ids):
        raise ValueError('Content ids must be positive integers')

    stmt = _apply_scope(select(Content), user).where(Content.id.in_(unique_ids))
    records = db.scalars(stmt).all()
    found_ids = {item.id for item in records}
    missing = [item_id for item_id in unique_ids if item_id not in found_ids]
    if missing:
        # Either does not exist or is outside the caller's authorization scope.
        raise PermissionError('One or more content ids are unavailable')

    by_id = {item.id: item for item in records}
    ordered = [by_id[item_id] for item_id in unique_ids]
    return [
        {
            'id': content.id,
            'title': content.title,
            'platform': content.platform,
            'content_type': content.content_type,
            'views': content.views,
            'likes': content.likes,
            'comments': content.comments,
            'shares': content.shares,
            'saves': content.saves,
            'watch_time': content.watch_time,
            'reach': content.reach,
            'engagement_rate': content.engagement_rate,
        }
        for content in ordered
    ]
