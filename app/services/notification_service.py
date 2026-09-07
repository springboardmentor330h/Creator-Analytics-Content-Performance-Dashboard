from sqlalchemy.orm import Session

from app.models.notification import Notification
from app.schemas.notification import (
    NotificationCreate,
    NotificationUpdate,
)

from app.services.analytics_service import (
    get_top_content,
    get_summary,
)

from app.services.revenue_service import (
    get_total_revenue,
)


# =========================================================
# NOTIFICATION CRUD
# =========================================================

def create_notification(
    db: Session,
    notification_data: NotificationCreate
):
    notification = Notification(
        creator_id=notification_data.creator_id,
        notification_type=notification_data.notification_type,
        title=notification_data.title,
        message=notification_data.message,
        is_read=False
    )

    db.add(notification)
    db.commit()
    db.refresh(notification)

    return notification


def get_notifications(
    db: Session,
    creator_id: int
):
    return (
        db.query(Notification)
        .filter(
            Notification.creator_id == creator_id
        )
        .order_by(
            Notification.created_at.desc()
        )
        .all()
    )


def get_notification(
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


def update_notification(
    db: Session,
    notification_id: int,
    creator_id: int,
    notification_data: NotificationUpdate
):
    notification = get_notification(
        db,
        notification_id,
        creator_id
    )

    if not notification:
        return None

    update_data = notification_data.model_dump(
        exclude_unset=True
    )

    for field, value in update_data.items():
        setattr(notification, field, value)

    db.commit()
    db.refresh(notification)

    return notification


def delete_notification(
    db: Session,
    notification_id: int,
    creator_id: int
):
    notification = get_notification(
        db,
        notification_id,
        creator_id
    )

    if not notification:
        return None

    db.delete(notification)
    db.commit()

    return notification


# =========================================================
# PERFORMANCE ALERTS
# =========================================================

def generate_performance_alert(
    db: Session,
    creator_id: int
):
    top_content = get_top_content(db)

    if not top_content:
        return None

    best_content = top_content[0]

    notification = Notification(
        creator_id=creator_id,
        notification_type="performance",
        title="Top Content Performance",
        message=(
            f"Your content '{best_content['content_title']}' "
            f"is performing well with an engagement rate of "
            f"{best_content['engagement_rate']}%."
        ),
        is_read=False
    )

    db.add(notification)
    db.commit()
    db.refresh(notification)

    return notification


# =========================================================
# ENGAGEMENT NOTIFICATIONS
# =========================================================

def generate_engagement_notification(
    db: Session,
    creator_id: int
):
    summary = get_summary(db)

    engagement_rate = summary["average_engagement_rate"]

    if engagement_rate >= 5:
        title = "High Engagement Alert"
        message = (
            f"Your content has a strong average engagement rate "
            f"of {engagement_rate}%."
        )
    elif engagement_rate > 0:
        title = "Engagement Update"
        message = (
            f"Your current average engagement rate is "
            f"{engagement_rate}%."
        )
    else:
        title = "Low Engagement Alert"
        message = (
            "Your content currently has no recorded engagement."
        )

    notification = Notification(
        creator_id=creator_id,
        notification_type="engagement",
        title=title,
        message=message,
        is_read=False
    )

    db.add(notification)
    db.commit()
    db.refresh(notification)

    return notification


# =========================================================
# REVENUE ALERTS
# =========================================================

def generate_revenue_alert(
    db: Session,
    creator_id: int
):
    total_revenue = get_total_revenue(
        db,
        creator_id
    )

    if total_revenue > 0:
        title = "Revenue Update"
        message = (
            f"Your total recorded revenue is "
            f"₹{total_revenue:.2f}."
        )
    else:
        title = "Revenue Alert"
        message = (
            "No revenue has been recorded for your account yet."
        )

    notification = Notification(
        creator_id=creator_id,
        notification_type="revenue",
        title=title,
        message=message,
        is_read=False
    )

    db.add(notification)
    db.commit()
    db.refresh(notification)

    return notification