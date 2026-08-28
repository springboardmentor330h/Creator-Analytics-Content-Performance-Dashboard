"""
Notification & alert generation.
Uses existing content / revenue data — no duplicate analytics engines.
"""

from datetime import datetime

from sqlalchemy.orm import Session

from app.models.content import Content
from app.models.notification import Notification
from app.models.revenue import Revenue
from app.services.analytics_service import calculate_engagement_rate


def create_notification(
    db: Session,
    creator_id: int,
    title: str,
    message: str,
    type: str = "info",
    link: str | None = None,
) -> Notification:
    notif = Notification(
        creator_id=creator_id,
        title=title,
        message=message,
        type=type,
        link=link,
        is_read=False,
        created_at=datetime.utcnow(),
    )
    db.add(notif)
    db.commit()
    db.refresh(notif)
    return notif


def list_notifications(
    db: Session,
    creator_id: int,
    unread_only: bool = False,
) -> tuple[list[Notification], int]:
    query = db.query(Notification).filter(
        Notification.creator_id == creator_id
    )
    if unread_only:
        query = query.filter(Notification.is_read.is_(False))

    items = (
        query.order_by(Notification.created_at.desc()).all()
    )
    unread_count = (
        db.query(Notification)
        .filter(
            Notification.creator_id == creator_id,
            Notification.is_read.is_(False),
        )
        .count()
    )
    return items, unread_count


def get_notification(
    db: Session,
    notification_id: int,
    creator_id: int,
) -> Notification | None:
    return (
        db.query(Notification)
        .filter(
            Notification.id == notification_id,
            Notification.creator_id == creator_id,
        )
        .first()
    )


def mark_as_read(
    db: Session,
    notification_id: int,
    creator_id: int,
) -> Notification | None:
    notif = get_notification(db, notification_id, creator_id)
    if not notif:
        return None
    notif.is_read = True
    db.commit()
    db.refresh(notif)
    return notif


def mark_all_as_read(db: Session, creator_id: int) -> int:
    updated = (
        db.query(Notification)
        .filter(
            Notification.creator_id == creator_id,
            Notification.is_read.is_(False),
        )
        .update({"is_read": True})
    )
    db.commit()
    return updated


def delete_notification(
    db: Session,
    notification_id: int,
    creator_id: int,
) -> bool:
    notif = get_notification(db, notification_id, creator_id)
    if not notif:
        return False
    db.delete(notif)
    db.commit()
    return True


def generate_performance_alerts(db: Session, creator_id: int) -> list[Notification]:
    """
    Create alerts for high-performing content (engagement rate >= 8%).
    """
    contents = (
        db.query(Content)
        .filter(Content.creator_id == creator_id)
        .all()
    )
    created = []
    for content in contents:
        _, rate = calculate_engagement_rate(content)
        if rate >= 8.0:
            title = "High-performing content"
            message = (
                f'"{content.content_title}" on {content.platform} '
                f"has engagement rate {rate}% "
                f"({content.views or 0} views)."
            )
            # Avoid spamming identical unread alerts
            exists = (
                db.query(Notification)
                .filter(
                    Notification.creator_id == creator_id,
                    Notification.type == "performance",
                    Notification.title == title,
                    Notification.message == message,
                    Notification.is_read.is_(False),
                )
                .first()
            )
            if exists:
                continue
            created.append(
                create_notification(
                    db,
                    creator_id=creator_id,
                    title=title,
                    message=message,
                    type="performance",
                    link="/content",
                )
            )
    return created


def generate_engagement_alerts(db: Session, creator_id: int) -> list[Notification]:
    """
    Alert when average engagement across content is low (< 2%).
    """
    contents = (
        db.query(Content)
        .filter(Content.creator_id == creator_id)
        .all()
    )
    if not contents:
        return []

    rates = [calculate_engagement_rate(c)[1] for c in contents]
    avg = sum(rates) / len(rates) if rates else 0

    if avg >= 2.0:
        return []

    title = "Engagement drop alert"
    message = (
        f"Average engagement rate is {round(avg, 2)}%. "
        "Consider reviewing content strategy."
    )
    exists = (
        db.query(Notification)
        .filter(
            Notification.creator_id == creator_id,
            Notification.type == "engagement",
            Notification.is_read.is_(False),
            Notification.title == title,
        )
        .first()
    )
    if exists:
        return []

    return [
        create_notification(
            db,
            creator_id=creator_id,
            title=title,
            message=message,
            type="engagement",
            link="/analytics",
        )
    ]


def generate_revenue_alerts(db: Session, creator_id: int) -> list[Notification]:
    """
    Alert when total revenue exceeds a simple milestone.
    """
    total = (
        db.query(Revenue)
        .filter(Revenue.creator_id == creator_id)
        .all()
    )
    amount = sum(r.amount or 0 for r in total)
    if amount < 1000:
        return []

    title = "Revenue milestone"
    message = (
        f"Your recorded revenue has reached "
        f"${round(amount, 2)}. Keep it up!"
    )
    exists = (
        db.query(Notification)
        .filter(
            Notification.creator_id == creator_id,
            Notification.type == "revenue",
            Notification.is_read.is_(False),
            Notification.title == title,
        )
        .first()
    )
    if exists:
        return []

    return [
        create_notification(
            db,
            creator_id=creator_id,
            title=title,
            message=message,
            type="revenue",
            link="/revenue",
        )
    ]


def run_all_alerts(db: Session, creator_id: int) -> dict:
    perf = generate_performance_alerts(db, creator_id)
    eng = generate_engagement_alerts(db, creator_id)
    rev = generate_revenue_alerts(db, creator_id)
    return {
        "performance_alerts": len(perf),
        "engagement_alerts": len(eng),
        "revenue_alerts": len(rev),
        "total_created": len(perf) + len(eng) + len(rev),
    }
