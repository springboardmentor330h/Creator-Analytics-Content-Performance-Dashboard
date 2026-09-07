from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.schemas.notification import NotificationListResponse, NotificationResponse
from app.services.notification_service import (
    generate_notifications,
    get_notifications_for_creator,
    mark_as_read,
)

router = APIRouter(prefix="/notifications", tags=["Notifications"])


@router.post("/generate/{creator_id}", response_model=list[NotificationResponse])
def generate(creator_id: int, db: Session = Depends(get_db)):
    """Runs outlier detection and persists any new alerts. Call this periodically
    (e.g. from a cron job or right after a sync) rather than on every page load."""
    return generate_notifications(db, creator_id)


@router.get("/creator/{creator_id}", response_model=NotificationListResponse)
def list_for_creator(creator_id: int, db: Session = Depends(get_db)):
    notifications = get_notifications_for_creator(db, creator_id)
    unread = sum(1 for n in notifications if not n.is_read)

    return {
        "total": len(notifications),
        "unread": unread,
        "notifications": notifications,
    }


@router.put("/{notification_id}/read", response_model=NotificationResponse)
def read(notification_id: int, db: Session = Depends(get_db)):
    note = mark_as_read(db, notification_id)
    if not note:
        raise HTTPException(status_code=404, detail="Notification not found")
    return note
