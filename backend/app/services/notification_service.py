from sqlalchemy.orm import Session

from app.models.notification import Notification
from app.models.content import Content
from app.models.revenue import Revenue
from app.services.analytics_service import calculate_engagement


def create_notification(db: Session, creator_id: int, type: str, title: str, message: str) -> Notification:
    notification = Notification(creator_id=creator_id, type=type, title=title, message=message)
    db.add(notification)
    db.commit()
    db.refresh(notification)
    return notification


def check_performance_alerts(db: Session, creator_id: int) -> list:
    """Flags content with unusually low engagement rate."""
    content_items = db.query(Content).filter(Content.creator_id == creator_id).all()
    created = []

    for c in content_items:
        rate = calculate_engagement(c)["engagement_rate"]
        if rate < 2.0:  # threshold: low engagement
            note = create_notification(
                db, creator_id, "performance",
                "Low Engagement Alert",
                f"'{c.content_title}' on {c.platform} has a low engagement rate of {rate}%."
            )
            created.append(note)

    return created


def check_engagement_alerts(db: Session, creator_id: int) -> list:
    """Flags standout high-performing content."""
    content_items = db.query(Content).filter(Content.creator_id == creator_id).all()
    created = []

    for c in content_items:
        rate = calculate_engagement(c)["engagement_rate"]
        if rate > 15.0:  # threshold: high engagement worth celebrating
            note = create_notification(
                db, creator_id, "engagement",
                "High Engagement!",
                f"'{c.content_title}' on {c.platform} is performing great with {rate}% engagement."
            )
            created.append(note)

    return created


def check_revenue_alerts(db: Session, creator_id: int) -> list:
    """Flags large revenue entries, skipping ones already alerted."""
    revenues = db.query(Revenue).filter(Revenue.creator_id == creator_id).all()
    created = []

    for r in revenues:
        if r.amount >= 10000:
            expected_message = f"You earned {r.amount} from {r.source} on {r.date}."

            already_exists = db.query(Notification).filter(
                Notification.creator_id == creator_id,
                Notification.type == "revenue",
                Notification.message == expected_message
            ).first()

            if already_exists:
                continue

            note = create_notification(
                db, creator_id, "revenue",
                "Revenue Milestone",
                expected_message
            )
            created.append(note)

    return created


def get_notifications(db: Session, creator_id: int, unread_only: bool = False) -> list:
    query = db.query(Notification).filter(Notification.creator_id == creator_id)
    if unread_only:
        query = query.filter(Notification.is_read == False)
    return query.order_by(Notification.created_at.desc()).all()


def mark_as_read(db: Session, notification_id: int, creator_id: int) -> Notification | None:
    notification = db.query(Notification).filter(
        Notification.id == notification_id, Notification.creator_id == creator_id
    ).first()
    if not notification:
        return None
    notification.is_read = True
    db.commit()
    db.refresh(notification)
    return notification