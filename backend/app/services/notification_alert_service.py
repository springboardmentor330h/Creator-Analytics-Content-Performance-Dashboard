from sqlalchemy.orm import Session
from sqlalchemy import func

from app.models.content import Content
from app.models.notification import Notification
from app.models.revenue import Revenue


# =====================================================
# PERFORMANCE ALERT
# =====================================================

def check_performance_alert(
    db: Session,
    creator_id: int,
    content_id: int
):
    content = (
        db.query(Content)
        .filter(
            Content.id == content_id,
            Content.creator_id == creator_id
        )
        .first()
    )

    if not content:
        return None

    total_engagement = (
        content.likes
        + content.comments
        + content.shares
        + content.saves
    )

    if total_engagement < 1000:
        return None

    notification = Notification(
        creator_id=creator_id,
        notification_type="Performance",
        title="High Performing Content",
        message=(
            f"Your content '{content.content_title}' "
            f"has reached {total_engagement} total engagements."
        )
    )

    db.add(notification)
    db.commit()
    db.refresh(notification)

    return notification


# =====================================================
# ENGAGEMENT NOTIFICATION
# =====================================================

def check_engagement_notification(
    db: Session,
    creator_id: int,
    content_id: int
):
    content = (
        db.query(Content)
        .filter(
            Content.id == content_id,
            Content.creator_id == creator_id
        )
        .first()
    )

    if not content:
        return None

    total_engagement = (
        content.likes
        + content.comments
        + content.shares
        + content.saves
    )

    # Engagement notification threshold
    if total_engagement < 500:
        return None

    notification = Notification(
        creator_id=creator_id,
        notification_type="Engagement",
        title="Engagement Milestone",
        message=(
            f"Your content '{content.content_title}' "
            f"has received {total_engagement} total engagements."
        )
    )

    db.add(notification)
    db.commit()
    db.refresh(notification)

    return notification


# =====================================================
# REVENUE ALERT
# =====================================================

def check_revenue_alert(
    db: Session,
    creator_id: int,
    threshold: float = 10000
):
    total_revenue = (
        db.query(
            func.coalesce(
                func.sum(Revenue.amount),
                0
            )
        )
        .filter(
            Revenue.creator_id == creator_id
        )
        .scalar()
    )

    total_revenue = float(total_revenue)

    if total_revenue < threshold:
        return None

    notification = Notification(
        creator_id=creator_id,
        notification_type="Revenue",
        title="Revenue Milestone Reached",
        message=(
            f"Your total revenue has reached "
            f"{total_revenue:.2f}."
        )
    )

    db.add(notification)
    db.commit()
    db.refresh(notification)

    return notification