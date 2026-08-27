from sqlalchemy.orm import Session

from app.models.content import Content
from app.schemas.content import ContentCreate, ContentUpdate
from app.utils.engagement import calculate_engagement_rate

from app.services.notification_service import (
    check_performance_alert,
    check_engagement_alert
)


def create_content(
    db: Session,
    content: ContentCreate,
    creator_id: int
):
    engagement_rate = calculate_engagement_rate(
        likes=content.likes,
        comments=content.comments,
        shares=content.shares,
        saves=content.saves,
        reach=content.reach
    )

    db_content = Content(
        creator_id=creator_id,
        content_title=content.content_title,
        platform=content.platform,
        content_type=content.content_type,
        views=content.views,
        likes=content.likes,
        comments=content.comments,
        shares=content.shares,
        saves=content.saves,
        watch_time=content.watch_time,
        reach=content.reach,
        published_date=content.published_date,
        engagement_rate=engagement_rate
    )

    db.add(db_content)
    db.commit()
    db.refresh(db_content)

    # Check performance alert
    check_performance_alert(
        db,
        creator_id,
        db_content
    )

    # Check engagement alert
    check_engagement_alert(
        db,
        creator_id,
        db_content
    )

    return db_content


def get_content(
    db: Session,
    content_id: int,
    creator_id: int
):
    return (
        db.query(Content)
        .filter(
            Content.id == content_id,
            Content.creator_id == creator_id
        )
        .first()
    )


def get_all_content(
    db: Session,
    creator_id: int
):
    return (
        db.query(Content)
        .filter(Content.creator_id == creator_id)
        .order_by(Content.published_date.desc())
        .all()
    )


def update_content(
    db: Session,
    content_id: int,
    content: ContentUpdate,
    creator_id: int
):
    db_content = get_content(
        db,
        content_id,
        creator_id
    )

    if not db_content:
        return None

    update_data = content.model_dump(exclude_unset=True)

    for key, value in update_data.items():
        setattr(db_content, key, value)

    engagement_rate = calculate_engagement_rate(
        likes=db_content.likes,
        comments=db_content.comments,
        shares=db_content.shares,
        saves=db_content.saves,
        reach=db_content.reach
    )

    db_content.engagement_rate = engagement_rate

    db.commit()
    db.refresh(db_content)

    # Check performance alert after update
    check_performance_alert(
        db,
        creator_id,
        db_content
    )

    # Check engagement alert after update
    check_engagement_alert(
        db,
        creator_id,
        db_content
    )

    return db_content


def delete_content(
    db: Session,
    content_id: int,
    creator_id: int
):
    db_content = get_content(
        db,
        content_id,
        creator_id
    )

    if not db_content:
        return None

    db.delete(db_content)
    db.commit()

    return db_content