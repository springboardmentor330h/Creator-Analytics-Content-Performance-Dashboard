"""
Notification service.

TWO RESPONSIBILITIES, kept in one file since they're small and tightly
related:
1. Plain CRUD (create/list/mark read/delete).
2. Alert generation — inspects a creator's EXISTING analytics (via the
   content/revenue services already built in Sprints 2 and 6) and
   creates Notification rows when something crosses a threshold. This
   never recomputes engagement rate, growth rate, or revenue totals
   itself; it calls the existing service functions and reacts to what
   they return, per the spec's "do not duplicate analytics logic" rule.
"""
import uuid
from typing import List, Optional
from sqlalchemy.orm import Session

from app.models.notification import Notification, NotificationType
from app.schemas.notification import NotificationCreate
from app.services import content_service, revenue_service


# ---------- CRUD ----------

def create_notification(db: Session, creator_id: uuid.UUID, data: NotificationCreate) -> Notification:
    notification = Notification(creator_id=creator_id, **data.model_dump())
    db.add(notification)
    db.commit()
    db.refresh(notification)
    return notification


def get_notification_by_id(
    db: Session, notification_id: uuid.UUID, creator_id: uuid.UUID
) -> Optional[Notification]:
    return (
        db.query(Notification)
        .filter(Notification.id == notification_id, Notification.creator_id == creator_id)
        .first()
    )


def list_notifications(
    db: Session,
    creator_id: uuid.UUID,
    notification_type: Optional[NotificationType] = None,
    unread_only: bool = False,
    skip: int = 0,
    limit: int = 50,
) -> tuple[List[Notification], int, int]:
    query = db.query(Notification).filter(Notification.creator_id == creator_id)

    if notification_type:
        query = query.filter(Notification.notification_type == notification_type)
    if unread_only:
        query = query.filter(Notification.is_read == False)  # noqa: E712

    total = query.count()
    unread_count = (
        db.query(Notification)
        .filter(Notification.creator_id == creator_id, Notification.is_read == False)  # noqa: E712
        .count()
    )
    items = query.order_by(Notification.created_at.desc()).offset(skip).limit(limit).all()
    return items, total, unread_count


def set_read_status(db: Session, notification: Notification, is_read: bool) -> Notification:
    notification.is_read = is_read
    db.commit()
    db.refresh(notification)
    return notification


def delete_notification(db: Session, notification: Notification) -> None:
    db.delete(notification)
    db.commit()


# ---------- Alert generation (reuses existing analytics services) ----------

LOW_ENGAGEMENT_THRESHOLD_PERCENT = 2.0
HIGH_ENGAGEMENT_THRESHOLD_PERCENT = 15.0
PENDING_REVENUE_ALERT_THRESHOLD = 100.0


def generate_engagement_alerts(db: Session, creator_id: uuid.UUID) -> List[Notification]:
    """Reuses content_service.get_kpi_summary() (Sprint 2) — never
    recomputes engagement rate here."""
    kpi = content_service.get_kpi_summary(db, creator_id)
    created = []

    if kpi["total_content"] == 0:
        return created

    if kpi["avg_engagement_rate"] < LOW_ENGAGEMENT_THRESHOLD_PERCENT:
        created.append(create_notification(db, creator_id, NotificationCreate(
            notification_type=NotificationType.engagement,
            title="Engagement rate is low",
            message=(
                f"Your average engagement rate is {kpi['avg_engagement_rate']}%, "
                f"below the {LOW_ENGAGEMENT_THRESHOLD_PERCENT}% watch threshold."
            ),
        )))
    elif kpi["avg_engagement_rate"] > HIGH_ENGAGEMENT_THRESHOLD_PERCENT:
        created.append(create_notification(db, creator_id, NotificationCreate(
            notification_type=NotificationType.engagement,
            title="Engagement rate is trending high",
            message=(
                f"Your average engagement rate is {kpi['avg_engagement_rate']}%, "
                f"above your usual range — nice work."
            ),
        )))

    return created


def generate_performance_alert_for_top_content(db: Session, creator_id: uuid.UUID) -> List[Notification]:
    """Reuses content_service.get_top_performing_content() (Sprint 2)."""
    top = content_service.get_top_performing_content(db, creator_id, limit=1)
    if not top:
        return []

    best = content_service.to_response_dict(top[0])
    return [create_notification(db, creator_id, NotificationCreate(
        notification_type=NotificationType.performance,
        title="Top performing content",
        message=(
            f"'{best['title']}' is your top performer right now at "
            f"{best['engagement_rate']}% engagement."
        ),
    ))]


def generate_revenue_alerts(db: Session, creator_id: uuid.UUID) -> List[Notification]:
    """Reuses revenue_service.get_revenue_kpi_summary() (Sprint 6)."""
    kpi = revenue_service.get_revenue_kpi_summary(db, creator_id)
    created = []

    if kpi["pending_revenue"] >= PENDING_REVENUE_ALERT_THRESHOLD:
        created.append(create_notification(db, creator_id, NotificationCreate(
            notification_type=NotificationType.revenue,
            title="Pending revenue awaiting confirmation",
            message=f"You have ${kpi['pending_revenue']:.2f} in pending revenue across your records.",
        )))

    if kpi["active_sponsorships"] > 0:
        created.append(create_notification(db, creator_id, NotificationCreate(
            notification_type=NotificationType.revenue,
            title="Active sponsorships",
            message=f"You have {kpi['active_sponsorships']} active sponsorship deal(s).",
        )))

    return created


def generate_all_alerts(db: Session, creator_id: uuid.UUID) -> List[Notification]:
    """
    Runs every alert check and returns everything newly created. Safe to
    call repeatedly — each call creates fresh notification rows
    reflecting current data, rather than trying to update old ones,
    since each alert represents "this was true at the time generated."
    """
    created = []
    created += generate_engagement_alerts(db, creator_id)
    created += generate_performance_alert_for_top_content(db, creator_id)
    created += generate_revenue_alerts(db, creator_id)
    return created
