from sqlalchemy.orm import Session

from app.models.notification import Notification
from app.schemas.notification import NotificationCreate
from app.models.content import Content
from app.models.revenue import Revenue


def create_notification(
    db: Session,
    notification_data: NotificationCreate,
    creator_id: int
):
    notification = Notification(
        creator_id=creator_id,
        notification_type=notification_data.notification_type,
        title=notification_data.title,
        message=notification_data.message
    )

    db.add(notification)
    db.commit()
    db.refresh(notification)

    return notification


def get_all_notifications(
    db: Session,
    creator_id: int
):
    return (
        db.query(Notification)
        .filter(Notification.creator_id == creator_id)
        .order_by(Notification.created_at.desc())
        .all()
    )


def get_unread_notifications(
    db: Session,
    creator_id: int
):
    return (
        db.query(Notification)
        .filter(
            Notification.creator_id == creator_id,
            Notification.is_read == False
        )
        .order_by(Notification.created_at.desc())
        .all()
    )


def get_notification_by_id(
    db: Session,
    notification_id: int,
    creator_id: int
):
    return (
        db.query(Notification)
        .filter(
            Notification.id == notification_id,
            Notification.creator_id == creator_id
        )
        .first()
    )


def mark_notification_as_read(
    db: Session,
    notification: Notification
):
    notification.is_read = True

    db.commit()
    db.refresh(notification)

    return notification


def mark_all_notifications_as_read(
    db: Session,
    creator_id: int
):
    notifications = (
        db.query(Notification)
        .filter(
            Notification.creator_id == creator_id,
            Notification.is_read == False
        )
        .all()
    )

    for notification in notifications:
        notification.is_read = True

    db.commit()

    return len(notifications)

def check_performance_alert(
    db: Session,
    creator_id: int,
    content: Content
):
    if content.views >= 10000 or content.reach >= 10000:

        message = (
            f"Your content '{content.content_title}' "
            f"has reached {content.views} views "
            f"and {content.reach} reach."
        )

        existing_notification = (
            db.query(Notification)
            .filter(
                Notification.creator_id == creator_id,
                Notification.notification_type == "performance",
                Notification.message == message
            )
            .first()
        )

        if existing_notification:
            return existing_notification

        notification = Notification(
            creator_id=creator_id,
            notification_type="performance",
            title="Great Performance",
            message=message
        )

        db.add(notification)
        db.commit()
        db.refresh(notification)

        return notification

    return None


def check_engagement_alert(
    db: Session,
    creator_id: int,
    content: Content
):
    if content.engagement_rate >= 10:

        message = (
            f"Your content '{content.content_title}' "
            f"has an engagement rate of "
            f"{content.engagement_rate}%."
        )

        existing_notification = (
            db.query(Notification)
            .filter(
                Notification.creator_id == creator_id,
                Notification.notification_type == "engagement",
                Notification.message == message
            )
            .first()
        )

        if existing_notification:
            return existing_notification

        notification = Notification(
            creator_id=creator_id,
            notification_type="engagement",
            title="High Engagement",
            message=message
        )

        db.add(notification)
        db.commit()
        db.refresh(notification)

        return notification

    return None


def check_revenue_alert(
    db: Session,
    creator_id: int,
    revenue: Revenue
):
    if revenue.amount >= 10000:

        message = (
            f"You received {revenue.amount} "
            f"{revenue.currency} from "
            f"{revenue.source}."
        )

        existing_notification = (
            db.query(Notification)
            .filter(
                Notification.creator_id == creator_id,
                Notification.notification_type == "revenue",
                Notification.message == message
            )
            .first()
        )

        if existing_notification:
            return existing_notification

        notification = Notification(
            creator_id=creator_id,
            notification_type="revenue",
            title="Revenue Milestone",
            message=message
        )

        db.add(notification)
        db.commit()
        db.refresh(notification)

        return notification

    return None