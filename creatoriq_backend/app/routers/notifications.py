"""Notifications router — Sprint 7.

All endpoints enforce creator ownership. A creator can ONLY access their own
notifications. 404 is returned for any notification that doesn't exist or
belongs to another creator.
"""
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.core.auth import get_current_user
from app.db.database import get_db
from app.models.user import User
from app.schemas.notification import (
    NotificationCreate,
    NotificationResponse,
    NotificationUpdate,
)
from app.services.notification_service import (
    create_notification,
    delete_notification,
    generate_engagement_alerts,
    generate_performance_alerts,
    generate_revenue_alerts,
    get_creator_notifications,
    get_notification_by_id,
    get_unread_count,
    mark_all_notifications_read,
    mark_notification_read,
)

router = APIRouter(prefix="/notifications", tags=["Notifications"])


@router.get("", response_model=List[NotificationResponse])
@router.get("/", response_model=List[NotificationResponse], include_in_schema=False)
def list_notifications(
    skip: int = Query(default=0, ge=0),
    limit: int = Query(default=50, ge=1, le=200),
    unread_only: bool = Query(default=False),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Return notifications for the authenticated creator (newest first)."""
    return get_creator_notifications(db, current_user, skip=skip, limit=limit, unread_only=unread_only)


@router.get("/unread-count")
def unread_count(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Return count of unread notifications for the authenticated creator."""
    return {"unread_count": get_unread_count(db, current_user)}


@router.get("/{notification_id}", response_model=NotificationResponse)
def get_notification(
    notification_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Return a single notification. 404 if not found or not owned by the creator."""
    notification = get_notification_by_id(db, current_user, notification_id)
    if notification is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Notification not found",
        )
    return notification


@router.post("", response_model=NotificationResponse, status_code=status.HTTP_201_CREATED)
def create_new_notification(
    payload: NotificationCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Create a new notification for the authenticated creator."""
    return create_notification(db, current_user, payload)


@router.put("/read-all")
def mark_all_read(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Mark ALL unread notifications for the authenticated creator as read."""
    count = mark_all_notifications_read(db, current_user)
    return {"success": True, "marked_read": count}


@router.put("/{notification_id}/read", response_model=NotificationResponse)
def mark_single_read(
    notification_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Mark a single notification as read. 404 if not found or not owned."""
    notification = mark_notification_read(db, current_user, notification_id)
    if notification is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Notification not found",
        )
    return notification


@router.delete("/{notification_id}", status_code=status.HTTP_200_OK)
def delete_single_notification(
    notification_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Delete a notification. 404 if not found or not owned by the creator."""
    success = delete_notification(db, current_user, notification_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Notification not found",
        )
    return {"success": True, "message": "Notification deleted successfully"}


@router.post("/generate-alerts", status_code=status.HTTP_201_CREATED)
def generate_all_alerts(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Generate performance, engagement, and revenue alerts from real analytics data."""
    perf = generate_performance_alerts(db, current_user)
    eng = generate_engagement_alerts(db, current_user)
    rev = generate_revenue_alerts(db, current_user)
    total = len(perf) + len(eng) + len(rev)
    return {
        "success": True,
        "total_generated": total,
        "performance_alerts": len(perf),
        "engagement_alerts": len(eng),
        "revenue_alerts": len(rev),
        "message": f"{total} new alert(s) generated from your analytics data.",
    }
