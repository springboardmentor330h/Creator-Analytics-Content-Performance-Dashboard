from sqlalchemy.orm import Session

from app.models.notification import Notification
from app.schemas.notification import NotificationCreate


def create_notification(
    db: Session,
    notification_data: NotificationCreate
):
    notification = Notification(
        creator_id=notification_data.creator_id,
        notification_type=notification_data.notification_type,
        title=notification_data.title,
        message=notification_data.message
    )

    db.add(notification)
    db.commit()
    db.refresh(notification)

    return notification


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


def mark_notification_as_read(
    db: Session,
    notification_id: int,
    creator_id: int
):
    notification = (
        db.query(Notification)
        .filter(
            Notification.id == notification_id,
            Notification.creator_id == creator_id
        )
        .first()
    )

    if not notification:
        return None

    notification.is_read = True

    db.commit()
    db.refresh(notification)

    return notification


def delete_notification(
    db: Session,
    notification_id: int,
    creator_id: int
):
    notification = (
        db.query(Notification)
        .filter(
            Notification.id == notification_id,
            Notification.creator_id == creator_id
        )
        .first()
    )

    if not notification:
        return None

    db.delete(notification)
    db.commit()

    return notification