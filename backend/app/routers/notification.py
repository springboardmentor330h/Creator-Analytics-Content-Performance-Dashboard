from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.models.user import User
from app.core.auth import get_current_user
from app.services import notification_service

router = APIRouter()


def serialize_notification(n) -> dict:
    return {
        "id": n.id,
        "creator_id": n.creator_id,
        "type": n.type,
        "title": n.title,
        "message": n.message,
        "is_read": n.is_read,
        "created_at": n.created_at
    }


@router.post("/notifications/generate")
def generate_notifications(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    performance = notification_service.check_performance_alerts(db, current_user.id)
    engagement = notification_service.check_engagement_alerts(db, current_user.id)
    revenue = notification_service.check_revenue_alerts(db, current_user.id)

    return {
        "generated": len(performance) + len(engagement) + len(revenue),
        "performance_alerts": len(performance),
        "engagement_alerts": len(engagement),
        "revenue_alerts": len(revenue)
    }


@router.get("/notifications")
def get_notifications(
    unread_only: bool = False,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    notifications = notification_service.get_notifications(db, current_user.id, unread_only)
    return [serialize_notification(n) for n in notifications]


@router.put("/notifications/{notification_id}/read")
def mark_notification_read(
    notification_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    notification = notification_service.mark_as_read(db, notification_id, current_user.id)
    if not notification:
        raise HTTPException(status_code=404, detail="Notification not found")
    return serialize_notification(notification)