"""
Content service — CRUD + analytics calculations.

ENGAGEMENT RATE FORMULA (per the spec):
    (Likes + Comments + Shares + Saves) / Reach * 100

WHY divide by reach, not impressions?
Reach = unique people who saw it. Impressions = total views including
repeats. Engagement rate measures "of the people who saw this, how many
acted on it" — reach is the more meaningful denominator for that question.

WHY guard against reach == 0?
A brand-new post might have 0 reach recorded yet. Dividing by zero would
crash the request. We treat "no reach yet" as "0% engagement" rather
than an error, since it's not a broken state — it's just early data.
"""
import uuid
from datetime import datetime
from typing import Optional, List
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.models.content import Content, Platform
from app.schemas.content import ContentCreate, ContentUpdate


def calculate_engagement_rate(content: Content) -> float:
    if content.reach == 0:
        return 0.0
    engaged = content.likes + content.comments + content.shares + content.saves
    return round((engaged / content.reach) * 100, 2)


def to_response_dict(content: Content) -> dict:
    """
    Builds the dict ContentResponse needs, adding the computed
    engagement_rate field that doesn't exist as a DB column.
    """
    return {
        "id": content.id,
        "creator_id": content.creator_id,
        "platform": content.platform,
        "content_type": content.content_type,
        "title": content.title,
        "publish_date": content.publish_date,
        "reach": content.reach,
        "impressions": content.impressions,
        "likes": content.likes,
        "comments": content.comments,
        "shares": content.shares,
        "saves": content.saves,
        "views": content.views,
        "engagement_rate": calculate_engagement_rate(content),
        "created_at": content.created_at,
    }


def create_content(db: Session, creator_id: uuid.UUID, content_in: ContentCreate) -> Content:
    content = Content(creator_id=creator_id, **content_in.model_dump())
    db.add(content)
    db.commit()
    db.refresh(content)
    return content


def get_content_by_id(db: Session, content_id: uuid.UUID, creator_id: uuid.UUID) -> Optional[Content]:
    # Always filter by creator_id too — a creator should never be able
    # to fetch/edit/delete another creator's content via a guessed ID.
    return (
        db.query(Content)
        .filter(Content.id == content_id, Content.creator_id == creator_id)
        .first()
    )


def list_content(
    db: Session,
    creator_id: uuid.UUID,
    platform: Optional[Platform] = None,
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None,
    skip: int = 0,
    limit: int = 20,
) -> tuple[List[Content], int]:
    query = db.query(Content).filter(Content.creator_id == creator_id)

    if platform:
        query = query.filter(Content.platform == platform)
    if start_date:
        query = query.filter(Content.publish_date >= start_date)
    if end_date:
        query = query.filter(Content.publish_date <= end_date)

    total = query.count()
    items = query.order_by(Content.publish_date.desc()).offset(skip).limit(limit).all()
    return items, total


def update_content(db: Session, content: Content, content_in: ContentUpdate) -> Content:
    update_data = content_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(content, field, value)
    db.commit()
    db.refresh(content)
    return content


def delete_content(db: Session, content: Content) -> None:
    db.delete(content)
    db.commit()


def get_top_performing_content(
    db: Session, creator_id: uuid.UUID, limit: int = 5
) -> List[Content]:
    """
    "Top performing" ranked by engagement rate. Since engagement_rate
    isn't a DB column, we can't ORDER BY it in SQL — we fetch a
    reasonably-sized candidate set and sort in Python instead.
    """
    candidates = (
        db.query(Content)
        .filter(Content.creator_id == creator_id)
        .order_by(Content.publish_date.desc())
        .limit(200)  # cap so this stays fast even with lots of content
        .all()
    )
    candidates.sort(key=calculate_engagement_rate, reverse=True)
    return candidates[:limit]


def get_kpi_summary(db: Session, creator_id: uuid.UUID) -> dict:
    items = db.query(Content).filter(Content.creator_id == creator_id).all()

    if not items:
        return {
            "total_content": 0,
            "total_reach": 0,
            "total_impressions": 0,
            "total_engagement": 0,
            "avg_engagement_rate": 0.0,
        }

    total_reach = sum(c.reach for c in items)
    total_impressions = sum(c.impressions for c in items)
    total_engagement = sum(c.likes + c.comments + c.shares + c.saves for c in items)
    avg_rate = round(sum(calculate_engagement_rate(c) for c in items) / len(items), 2)

    return {
        "total_content": len(items),
        "total_reach": total_reach,
        "total_impressions": total_impressions,
        "total_engagement": total_engagement,
        "avg_engagement_rate": avg_rate,
    }


def get_platform_comparison(db: Session, creator_id: uuid.UUID) -> List[dict]:
    items = db.query(Content).filter(Content.creator_id == creator_id).all()

    by_platform: dict[Platform, list[Content]] = {}
    for item in items:
        by_platform.setdefault(item.platform, []).append(item)

    result = []
    for platform, contents in by_platform.items():
        total_reach = sum(c.reach for c in contents)
        total_engagement = sum(c.likes + c.comments + c.shares + c.saves for c in contents)
        avg_rate = round(
            sum(calculate_engagement_rate(c) for c in contents) / len(contents), 2
        )
        result.append(
            {
                "platform": platform,
                "total_content": len(contents),
                "total_reach": total_reach,
                "total_engagement": total_engagement,
                "avg_engagement_rate": avg_rate,
            }
        )
    return result
