from sqlalchemy.orm import Session

from app.models.content import Content
from app.models.revenue import Revenue
from app.models.notification import Notification
from app.services.analytics_service import calculate_engagement_rate


def create_notification_if_not_exists(
    db: Session,
    creator_id: int,
    title: str,
    message: str,
    notification_type: str
):
    existing_notification = (
        db.query(Notification)
        .filter(
            Notification.creator_id == creator_id,
            Notification.title == title,
            Notification.message == message
        )
        .first()
    )

    if existing_notification:
        return existing_notification

    notification = Notification(
        creator_id=creator_id,
        title=title,
        message=message,
        notification_type=notification_type
    )

    db.add(notification)
    db.commit()
    db.refresh(notification)

    return notification


def check_performance_alerts(db: Session, creator_id: int):
    contents = (
        db.query(Content)
        .filter(Content.creator_id == creator_id)
        .all()
    )

    alerts = []

    for content in contents:
        if content.views >= 10000:
            alert = create_notification_if_not_exists(
                db=db,
                creator_id=creator_id,
                title="Performance Alert",
                message=(
                    f"Your content '{content.content_title}' "
                    f"has reached {content.views} views!"
                ),
                notification_type="performance"
            )
            alerts.append(alert)

    return alerts


def check_engagement_alerts(db: Session, creator_id: int):
    contents = (
        db.query(Content)
        .filter(Content.creator_id == creator_id)
        .all()
    )

    alerts = []

    for content in contents:
        _, engagement_rate = calculate_engagement_rate(content)

        if engagement_rate >= 10:
            alert = create_notification_if_not_exists(
                db=db,
                creator_id=creator_id,
                title="Engagement Alert",
                message=(
                    f"Your content '{content.content_title}' has a high "
                    f"engagement rate of {engagement_rate}%."
                ),
                notification_type="engagement"
            )
            alerts.append(alert)

    return alerts


def check_revenue_alerts(db: Session, creator_id: int):
    revenues = (
        db.query(Revenue)
        .filter(Revenue.creator_id == creator_id)
        .all()
    )

    total_revenue = sum(revenue.amount for revenue in revenues)

    alerts = []

    if total_revenue >= 50000:
        alert = create_notification_if_not_exists(
            db=db,
            creator_id=creator_id,
            title="Revenue Milestone",
            message=(
                f"Congratulations! Your total revenue has reached "
                f"₹{total_revenue:,.2f}."
            ),
            notification_type="revenue"
        )
        alerts.append(alert)

    return alerts