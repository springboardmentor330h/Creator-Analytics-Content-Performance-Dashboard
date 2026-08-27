from sqlalchemy.orm import Session

from app.models.notification import Notification
from app.schemas.notification import (
    NotificationCreate,
    NotificationUpdate,
)


def create_notification(
    db: Session,
    notification_data: NotificationCreate,
):
    notification = Notification(
        creator_id=notification_data.creator_id,
        type=notification_data.type,
        title=notification_data.title,
        message=notification_data.message,
        is_read=notification_data.is_read,
    )

    db.add(notification)
    db.commit()
    db.refresh(notification)

    return notification


def get_notifications(
    db: Session,
    creator_id: int,
):
    return (
        db.query(Notification)
        .filter(Notification.creator_id == creator_id)
        .order_by(Notification.created_at.desc())
        .all()
    )


def get_notification(
    db: Session,
    notification_id: int,
    creator_id: int,
):
    return (
        db.query(Notification)
        .filter(
            Notification.id == notification_id,
            Notification.creator_id == creator_id,
        )
        .first()
    )


def update_notification(
    db: Session,
    notification: Notification,
    notification_data: NotificationUpdate,
):
    update_data = notification_data.model_dump(
        exclude_unset=True,
    )

    for field, value in update_data.items():
        setattr(notification, field, value)

    db.commit()
    db.refresh(notification)

    return notification


def delete_notification(
    db: Session,
    notification: Notification,
):
    db.delete(notification)
    db.commit()


def mark_notification_as_read(
    db: Session,
    notification: Notification,
):
    notification.is_read = True

    db.commit()
    db.refresh(notification)

    return notification