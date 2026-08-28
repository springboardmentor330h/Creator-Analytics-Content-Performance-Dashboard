from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.services import alert_service

from app.db.database import get_db
from app.schemas.notification import (
    NotificationCreate,
    NotificationResponse,
)
from app.services import notification_service


router = APIRouter(
    prefix="/notifications",
    tags=["Notifications"]
)


@router.post(
    "/",
    response_model=NotificationResponse,
    status_code=status.HTTP_201_CREATED
)
def create_notification(
    notification: NotificationCreate,
    db: Session = Depends(get_db)
):
    return notification_service.create_notification(
        db,
        notification
    )


@router.get(
    "/creator/{creator_id}",
    response_model=List[NotificationResponse]
)
def get_notifications(
    creator_id: int,
    db: Session = Depends(get_db)
):
    return notification_service.get_creator_notifications(
        db,
        creator_id
    )


@router.patch(
    "/{notification_id}/read",
    response_model=NotificationResponse
)
def mark_notification_as_read(
    notification_id: int,
    db: Session = Depends(get_db)
):
    notification = notification_service.mark_notification_read(
        db,
        notification_id
    )

    if not notification:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Notification not found"
        )

    return notification


@router.delete(
    "/{notification_id}",
    status_code=status.HTTP_204_NO_CONTENT
)
def delete_notification(
    notification_id: int,
    db: Session = Depends(get_db)
):
    notification = notification_service.delete_notification(
        db,
        notification_id
    )

    if not notification:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Notification not found"
        )

    return None
@router.post("/check-alerts/{creator_id}")
def check_automatic_alerts(
    creator_id: int,
    db: Session = Depends(get_db)
):
    performance_alerts = alert_service.check_performance_alerts(
        db,
        creator_id
    )

    engagement_alerts = alert_service.check_engagement_alerts(
        db,
        creator_id
    )

    revenue_alerts = alert_service.check_revenue_alerts(
        db,
        creator_id
    )

    return {
        "message": "Automatic alert check completed",
        "performance_alerts": performance_alerts,
        "engagement_alerts": engagement_alerts,
        "revenue_alerts": revenue_alerts
    }