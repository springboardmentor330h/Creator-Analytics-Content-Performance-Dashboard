import statistics

from sqlalchemy.orm import Session

from app.models.content import Content
from app.models.notification import Notification
from app.services.analytics_service import calculate_engagement_rate


def _create(db: Session, creator_id: int, notification_type: str, title: str, message: str):
    note = Notification(
        creator_id=creator_id,
        notification_type=notification_type,
        title=title,
        message=message,
    )
    db.add(note)
    return note


def generate_notifications(db: Session, creator_id: int):
    """Statistical outlier detection over a creator's content + revenue.

    Flags any content whose engagement rate is > 1.5 standard deviations
    above the creator's own mean, and any month-over-month revenue drop.
    Returns the list of newly created notifications.
    """
    created = []

    # --- Performance outliers ---
    contents = db.query(Content).filter(Content.creator_id == creator_id).all()
    rates = [calculate_engagement_rate(c) for c in contents]

    if len(rates) >= 3:
        mean = statistics.mean(rates)
        stdev = statistics.pstdev(rates) or 1  # avoid div-by-zero

        for content, rate in zip(contents, rates):
            if rate > mean + 1.5 * stdev:
                note = _create(
                    db,
                    creator_id,
                    "performance",
                    "Content is over-performing",
                    f'"{content.content_title}" on {content.platform} has an engagement '
                    f"rate of {rate}%, well above your average of {round(mean, 2)}%.",
                )
                created.append(note)

    # --- Revenue drop alerts ---
    from app.services.revenue_service import get_revenue_trend

    trend = get_revenue_trend(db, creator_id)
    if trend.get("trend") == "down" and abs(trend.get("change_percent", 0)) >= 15:
        note = _create(
            db,
            creator_id,
            "revenue",
            "Revenue dropped this month",
            f"Revenue fell {abs(trend['change_percent'])}% compared to last month "
            f"({trend['latest_month']}).",
        )
        created.append(note)

    if created:
        db.commit()
        for note in created:
            db.refresh(note)

    return created


def get_notifications_for_creator(db: Session, creator_id: int):
    return (
        db.query(Notification)
        .filter(Notification.creator_id == creator_id)
        .order_by(Notification.created_at.desc())
        .all()
    )


def mark_as_read(db: Session, notification_id: int, current_user):
    from app.core.auth import assert_owner_or_admin

    note = db.query(Notification).filter(Notification.id == notification_id).first()
    if not note:
        return None
    assert_owner_or_admin(current_user, note.creator_id)
    note.is_read = True
    db.commit()
    db.refresh(note)
    return note
