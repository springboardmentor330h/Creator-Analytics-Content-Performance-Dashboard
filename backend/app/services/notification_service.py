from sqlalchemy.orm import Session

from app.models.notification import Notification
from app.schemas.notification import NotificationCreate


def create_notification(
    db: Session,
    notification: NotificationCreate
):
    new_notification = Notification(
        **notification.model_dump()
    )

    db.add(new_notification)
    db.commit()
    db.refresh(new_notification)

    return new_notification


def get_creator_notifications(
    db: Session,
    creator_id: int
):
    return (
        db.query(Notification)
        .filter(Notification.creator_id == creator_id)
        .order_by(Notification.created_at.desc())
        .all()
    )


def get_notification_by_id(
    db: Session,
    notification_id: int
):
    return (
        db.query(Notification)
        .filter(Notification.id == notification_id)
        .first()
    )


def mark_notification_read(
    db: Session,
    notification_id: int
):
    notification = get_notification_by_id(
        db,
        notification_id
    )

    if not notification:
        return None

    notification.is_read = True

    db.commit()
    db.refresh(notification)

    return notification


def delete_notification(
    db: Session,
    notification_id: int
):
    notification = get_notification_by_id(
        db,
        notification_id
    )

    if not notification:
        return None

    db.delete(notification)
    db.commit()

    return notification