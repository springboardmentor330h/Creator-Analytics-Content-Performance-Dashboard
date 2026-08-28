from sqlalchemy.orm import Session
from app.models.notification import Notification
from app.models.content import Content
from app.models.revenue import RevenueRecord
from app.services.analytics_service import calculate_engagement_rate


def generate_performance_alerts(db: Session, creator_id: int) -> list[Notification]:
    items = db.query(Content).filter(Content.creator_id == creator_id).all()
    if not items:
        return []

    rates = [calculate_engagement_rate(c) for c in items]
    avg_rate = sum(rates) / len(rates)
    created = []

    for c in items:
        rate = calculate_engagement_rate(c)
        if rate > avg_rate * 1.5:
            notif_type, title = "performance_alert", "High Performing Content"
            message = f"'{c.content_title}' is performing significantly above average ({rate}% engagement)."
        elif rate < avg_rate * 0.5 and avg_rate > 0:
            notif_type, title = "performance_alert", "Low Performing Content"
            message = f"'{c.content_title}' is performing below average ({rate}% engagement)."
        else:
            continue

        exists = db.query(Notification).filter(
            Notification.creator_id == creator_id, Notification.message == message
        ).first()
        if exists:
            continue

        notif = Notification(creator_id=creator_id, type=notif_type, title=title, message=message)
        db.add(notif)
        db.commit()
        db.refresh(notif)
        created.append(notif)

    return created


def generate_revenue_alerts(db: Session, creator_id: int, threshold_pct: float = 30.0) -> list[Notification]:
    records = (
        db.query(RevenueRecord)
        .filter(RevenueRecord.creator_id == creator_id)
        .order_by(RevenueRecord.earned_date.asc())
        .all()
    )
    if len(records) < 2:
        return []

    created = []
    for i in range(1, len(records)):
        prev, curr = records[i - 1].amount, records[i].amount
        if prev == 0:
            continue
        change_pct = ((curr - prev) / prev) * 100
        if abs(change_pct) < threshold_pct:
            continue

        title = "Revenue Spike" if change_pct > 0 else "Revenue Drop"
        message = f"Revenue changed by {round(change_pct, 2)}% on {records[i].earned_date.isoformat()} (${curr})."

        exists = db.query(Notification).filter(
            Notification.creator_id == creator_id, Notification.message == message
        ).first()
        if exists:
            continue

        notif = Notification(creator_id=creator_id, type="revenue_alert", title=title, message=message)
        db.add(notif)
        db.commit()
        db.refresh(notif)
        created.append(notif)

    return created


def get_notifications(db: Session, creator_id: int, unread_only: bool = False) -> list[Notification]:
    query = db.query(Notification).filter(Notification.creator_id == creator_id)
    if unread_only:
        query = query.filter(Notification.is_read == False)
    return query.order_by(Notification.created_at.desc()).all()


def mark_as_read(db: Session, notification_id: int) -> Notification | None:
    notif = db.query(Notification).filter(Notification.id == notification_id).first()
    if not notif:
        return None
    notif.is_read = True
    db.commit()
    db.refresh(notif)
    return notif


def mark_all_as_read(db: Session, creator_id: int) -> int:
    count = (
        db.query(Notification)
        .filter(Notification.creator_id == creator_id, Notification.is_read == False)
        .update({"is_read": True})
    )
    db.commit()
    return count


def get_notification_counts(db: Session, creator_id: int) -> dict:
    total = db.query(Notification).filter(Notification.creator_id == creator_id).count()
    unread = db.query(Notification).filter(
        Notification.creator_id == creator_id, Notification.is_read == False
    ).count()
    return {"total": total, "unread": unread}