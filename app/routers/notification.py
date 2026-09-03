from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.schemas.notification import (
    NotificationCreate,
    NotificationResponse
)

from app.services.notification_service import (
    create_notification,
    get_creator_notifications,
    mark_notification_as_read,
    delete_notification
)

from app.services.notification_alert_service import (
    check_performance_alert,
    check_engagement_notification,
    check_revenue_alert
)


router = APIRouter(
    prefix="/notifications",
    tags=["Notifications"]
)


# =====================================================
# CREATE NOTIFICATION
# =====================================================

@router.post(
    "/",
    response_model=NotificationResponse,
    status_code=status.HTTP_201_CREATED
)
def create_notification_api(
    notification_data: NotificationCreate,
    db: Session = Depends(get_db)
):
    return create_notification(
        db,
        notification_data
    )


# =====================================================
# PERFORMANCE ALERT
# =====================================================

@router.post(
    "/alerts/performance/{creator_id}/{content_id}",
    response_model=NotificationResponse
)
def performance_alert(
    creator_id: int,
    content_id: int,
    db: Session = Depends(get_db)
):
    notification = check_performance_alert(
        db,
        creator_id,
        content_id
    )

    if not notification:
        raise HTTPException(
            status_code=404,
            detail="Content not found or performance threshold not reached"
        )

    return notification


# =====================================================
# ENGAGEMENT NOTIFICATION
# =====================================================

@router.post(
    "/alerts/engagement/{creator_id}/{content_id}",
    response_model=NotificationResponse
)
def engagement_notification(
    creator_id: int,
    content_id: int,
    db: Session = Depends(get_db)
):
    notification = check_engagement_notification(
        db,
        creator_id,
        content_id
    )

    if not notification:
        raise HTTPException(
            status_code=404,
            detail="Content not found or engagement threshold not reached"
        )

    return notification


# =====================================================
# REVENUE ALERT
# =====================================================

@router.post(
    "/alerts/revenue/{creator_id}",
    response_model=NotificationResponse
)
def revenue_alert(
    creator_id: int,
    db: Session = Depends(get_db)
):
    notification = check_revenue_alert(
        db,
        creator_id
    )

    if not notification:
        raise HTTPException(
            status_code=404,
            detail="Revenue threshold not reached"
        )

    return notification


# =====================================================
# GET CREATOR NOTIFICATIONS
# =====================================================

@router.get(
    "/{creator_id}",
    response_model=list[NotificationResponse]
)
def get_notifications(
    creator_id: int,
    db: Session = Depends(get_db)
):
    return get_creator_notifications(
        db,
        creator_id
    )


# =====================================================
# MARK NOTIFICATION AS READ
# =====================================================

@router.put(
    "/{notification_id}/read",
    response_model=NotificationResponse
)
def mark_as_read(
    notification_id: int,
    creator_id: int,
    db: Session = Depends(get_db)
):
    notification = mark_notification_as_read(
        db,
        notification_id,
        creator_id
    )

    if not notification:
        raise HTTPException(
            status_code=404,
            detail="Notification not found"
        )

    return notification


# =====================================================
# DELETE NOTIFICATION
# =====================================================

@router.delete(
    "/{notification_id}",
    status_code=status.HTTP_204_NO_CONTENT
)
def delete_notification_api(
    notification_id: int,
    creator_id: int,
    db: Session = Depends(get_db)
):
    notification = delete_notification(
        db,
        notification_id,
        creator_id
    )

    if not notification:
        raise HTTPException(
            status_code=404,
            detail="Notification not found"
        )

    return None