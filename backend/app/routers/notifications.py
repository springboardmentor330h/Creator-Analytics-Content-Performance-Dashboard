from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional

from backend.app.db.database import get_db
from backend.app.models.user import User
from backend.app.core.deps import get_current_user
from backend.app.services.notification_service import NotificationService
from backend.app.schemas.notification import (
    NotificationResponse,
    NotificationSummaryResponse,
    NotificationCreate
)

router = APIRouter(
    prefix="/notifications",
    tags=["Notifications & Alerts"]
)


@router.get("", response_model=List[NotificationResponse])
@router.get("/", response_model=List[NotificationResponse])
def get_notifications(
    unread_only: bool = Query(False, description="Filter for unread notifications only"),
    type: Optional[str] = Query(None, description="Filter by category (performance, engagement, revenue, system)"),
    limit: int = Query(50, ge=1, le=200),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Retrieve all notifications belonging to the authenticated creator."""
    return NotificationService.get_notifications(
        db=db,
        creator_id=current_user.id,
        unread_only=unread_only,
        type_filter=type,
        limit=limit
    )


@router.get("/unread-count")
@router.get("/unread-count/")
def get_unread_count(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get total unread notification count for the authenticated creator."""
    count = NotificationService.get_unread_count(db, current_user.id)
    return {"unread_count": count}


@router.put("/read-all")
@router.put("/read-all/")
def mark_all_read(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Mark all unread notifications as read for the authenticated creator."""
    count = NotificationService.mark_all_as_read(db, current_user.id)
    return {"message": "All notifications marked as read", "updated_count": count}


@router.put("/{notification_id}/read", response_model=NotificationResponse)
def mark_notification_read(
    notification_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Mark a specific notification as read."""
    notif = NotificationService.mark_as_read(db, current_user.id, notification_id)
    if not notif:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Notification not found"
        )
    return notif


@router.post("/check-alerts", response_model=List[NotificationResponse])
@router.post("/check-alerts/", response_model=List[NotificationResponse])
def trigger_alert_check(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Trigger real-time metric analysis to generate contextual performance,
    engagement, and revenue alerts.
    """
    return NotificationService.generate_alerts(db, current_user.id)


@router.post("", response_model=NotificationResponse, status_code=status.HTTP_201_CREATED)
@router.post("/", response_model=NotificationResponse, status_code=status.HTTP_201_CREATED)
def create_notification(
    notif_in: NotificationCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a new manual notification for testing or system alerts."""
    return NotificationService.create_notification(db, current_user.id, notif_in)


@router.delete("/{notification_id}", status_code=status.HTTP_200_OK)
def delete_notification(
    notification_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Delete a notification entry."""
    success = NotificationService.delete_notification(db, current_user.id, notification_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Notification not found"
        )
    return {"message": "Notification deleted successfully"}
