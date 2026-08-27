"""Notification service — business logic for creator notifications.

All functions enforce strict creator ownership. No notification from another
creator is ever returned or mutated.
"""
from datetime import datetime
from typing import List, Optional

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.content import Content
from app.models.notification import Notification, NOTIFICATION_TYPES
from app.models.revenue import Revenue
from app.models.user import User
from app.schemas.notification import NotificationCreate, NotificationUpdate
from app.services.analytics_service import calculate_item_engagement_rate
from app.services.content_service import _apply_scope
from app.services.revenue_service import get_monthly_revenue


# ---------------------------------------------------------------------------
# CRUD helpers
# ---------------------------------------------------------------------------

def _owned_notification(db: Session, user: User, notification_id: int) -> Optional[Notification]:
    """Return notification only if it belongs to the authenticated creator."""
    stmt = (
        select(Notification)
        .where(Notification.id == notification_id)
        .where(Notification.creator_id == user.id)
    )
    return db.scalars(stmt).first()


def create_notification(db: Session, user: User, payload: NotificationCreate) -> Notification:
    """Create a notification for the authenticated creator."""
    n_type = payload.notification_type
    if n_type not in NOTIFICATION_TYPES:
        n_type = "general"

    notification = Notification(
        creator_id=user.id,
        title=payload.title.strip(),
        message=payload.message.strip(),
        notification_type=n_type,
        is_read=payload.is_read,
        created_at=datetime.utcnow(),
    )
    db.add(notification)
    db.commit()
    db.refresh(notification)
    return notification


def get_creator_notifications(
    db: Session,
    user: User,
    skip: int = 0,
    limit: int = 50,
    unread_only: bool = False,
) -> List[Notification]:
    """Return notifications for the authenticated creator, newest first."""
    stmt = (
        select(Notification)
        .where(Notification.creator_id == user.id)
        .order_by(Notification.created_at.desc())
        .offset(max(0, skip))
        .limit(min(max(1, limit), 200))
    )
    if unread_only:
        stmt = stmt.where(Notification.is_read == False)  # noqa: E712
    return list(db.scalars(stmt).all())


def get_notification_by_id(db: Session, user: User, notification_id: int) -> Optional[Notification]:
    """Return a single notification enforcing creator ownership."""
    return _owned_notification(db, user, notification_id)


def mark_notification_read(db: Session, user: User, notification_id: int) -> Optional[Notification]:
    """Mark a single notification as read. Returns None if not found/owned."""
    notification = _owned_notification(db, user, notification_id)
    if notification is None:
        return None
    notification.is_read = True
    db.commit()
    db.refresh(notification)
    return notification


def mark_all_notifications_read(db: Session, user: User) -> int:
    """Mark all unread notifications for the creator as read. Returns count updated."""
    stmt = (
        select(Notification)
        .where(Notification.creator_id == user.id)
        .where(Notification.is_read == False)  # noqa: E712
    )
    notifications = db.scalars(stmt).all()
    count = 0
    for n in notifications:
        n.is_read = True
        count += 1
    db.commit()
    return count


def delete_notification(db: Session, user: User, notification_id: int) -> bool:
    """Delete a notification. Returns False if not found or not owned."""
    notification = _owned_notification(db, user, notification_id)
    if notification is None:
        return False
    db.delete(notification)
    db.commit()
    return True


def get_unread_count(db: Session, user: User) -> int:
    """Return number of unread notifications for creator."""
    stmt = (
        select(Notification)
        .where(Notification.creator_id == user.id)
        .where(Notification.is_read == False)  # noqa: E712
    )
    return len(db.scalars(stmt).all())


# ---------------------------------------------------------------------------
# Alert generators — backed by real PostgreSQL data
# ---------------------------------------------------------------------------

def _notification_exists(db: Session, user: User, title: str) -> bool:
    """Avoid duplicate alert notifications within the last 30 days."""
    from datetime import timedelta
    cutoff = datetime.utcnow() - timedelta(days=30)
    stmt = (
        select(Notification)
        .where(Notification.creator_id == user.id)
        .where(Notification.title == title)
        .where(Notification.created_at >= cutoff)
    )
    return db.scalars(stmt).first() is not None


def generate_performance_alerts(db: Session, user: User) -> List[Notification]:
    """Generate performance notifications for high-view content."""
    created: List[Notification] = []
    content_stmt = _apply_scope(select(Content), user)
    records = db.scalars(content_stmt).all()
    if not records:
        return created

    # Compute mean views to determine "high" threshold
    all_views = [c.views for c in records]
    avg_views = sum(all_views) / len(all_views) if all_views else 0
    threshold = max(avg_views * 1.5, 1000)

    for item in records:
        if item.views >= threshold:
            title = f"🚀 High Views: {item.title[:60]}"
            if not _notification_exists(db, user, title):
                n = Notification(
                    creator_id=user.id,
                    title=title,
                    message=(
                        f'Your content "{item.title}" on {item.platform} has reached '
                        f"{item.views:,} views — significantly above your average of "
                        f"{int(avg_views):,} views. Great performance!"
                    ),
                    notification_type="performance",
                    is_read=False,
                    created_at=datetime.utcnow(),
                )
                db.add(n)
                created.append(n)

    db.commit()
    for n in created:
        db.refresh(n)
    return created


def generate_engagement_alerts(db: Session, user: User) -> List[Notification]:
    """Generate engagement notifications for above-average engagement rates."""
    created: List[Notification] = []
    content_stmt = _apply_scope(select(Content), user)
    records = db.scalars(content_stmt).all()
    if not records:
        return created

    rates = [calculate_item_engagement_rate(c) for c in records]
    avg_rate = sum(rates) / len(rates) if rates else 0.0
    threshold = max(avg_rate * 1.5, 3.0)  # at least 3% and 1.5× avg

    for item, rate in zip(records, rates):
        if rate >= threshold:
            title = f"⚡ High Engagement: {item.title[:60]}"
            if not _notification_exists(db, user, title):
                n = Notification(
                    creator_id=user.id,
                    title=title,
                    message=(
                        f'Your content "{item.title}" achieved an engagement rate of '
                        f"{rate:.2f}% on {item.platform}, exceeding your average of "
                        f"{avg_rate:.2f}%. Excellent audience connection!"
                    ),
                    notification_type="engagement",
                    is_read=False,
                    created_at=datetime.utcnow(),
                )
                db.add(n)
                created.append(n)

    db.commit()
    for n in created:
        db.refresh(n)
    return created


def generate_revenue_alerts(db: Session, user: User) -> List[Notification]:
    """Generate revenue milestone alerts using existing revenue service."""
    created: List[Notification] = []
    monthly_data = get_monthly_revenue(db, user)
    if not monthly_data:
        return created

    MILESTONE = 50_000.0  # ₹50,000

    for item in monthly_data:
        if item["revenue"] >= MILESTONE:
            title = f"💰 Revenue Milestone: {item['month']}"
            if not _notification_exists(db, user, title):
                n = Notification(
                    creator_id=user.id,
                    title=title,
                    message=(
                        f"Your revenue for {item['month']} crossed ₹{MILESTONE:,.0f}! "
                        f"You earned ₹{item['revenue']:,.2f} this month. Keep it up!"
                    ),
                    notification_type="revenue",
                    is_read=False,
                    created_at=datetime.utcnow(),
                )
                db.add(n)
                created.append(n)

    # Also check total revenue milestones
    total_rev_stmt = select(Revenue).where(Revenue.creator_id == user.id)
    all_rev = db.scalars(total_rev_stmt).all()
    total_rev = sum(r.amount for r in all_rev)
    milestones = [100_000, 500_000, 1_000_000]
    for milestone in milestones:
        if total_rev >= milestone:
            title = f"🏆 Total Revenue Milestone: ₹{milestone:,.0f}"
            if not _notification_exists(db, user, title):
                n = Notification(
                    creator_id=user.id,
                    title=title,
                    message=(
                        f"Congratulations! Your total cumulative revenue has crossed "
                        f"₹{milestone:,.0f}. Current total: ₹{total_rev:,.2f}."
                    ),
                    notification_type="revenue",
                    is_read=False,
                    created_at=datetime.utcnow(),
                )
                db.add(n)
                created.append(n)
            break  # only alert for highest milestone reached

    db.commit()
    for n in created:
        db.refresh(n)
    return created
