from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.schemas.notification import (
    NotificationCreate,
    NotificationResponse,
    NotificationUpdate,
)
from app.services.notification_service import (
    create_notification,
    get_notifications,
    get_notification,
    update_notification,
    delete_notification,
    generate_performance_alert,
    generate_engagement_notification,
    generate_revenue_alert,
)


router = APIRouter(
    prefix="/notifications",
    tags=["Notifications"]
)


# =========================================================
# NOTIFICATION CRUD
# =========================================================

@router.post(
    "/",
    response_model=NotificationResponse
)
def create_notification_api(
    notification_data: NotificationCreate,
    db: Session = Depends(get_db)
):
    return create_notification(
        db,
        notification_data
    )


@router.get(
    "/",
    response_model=list[NotificationResponse]
)
def get_notifications_api(
    creator_id: int,
    db: Session = Depends(get_db)
):
    return get_notifications(
        db,
        creator_id
    )


@router.get(
    "/{notification_id}",
    response_model=NotificationResponse
)
def get_notification_api(
    notification_id: int,
    creator_id: int,
    db: Session = Depends(get_db)
):
    notification = get_notification(
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


@router.put(
    "/{notification_id}",
    response_model=NotificationResponse
)
def update_notification_api(
    notification_id: int,
    creator_id: int,
    notification_data: NotificationUpdate,
    db: Session = Depends(get_db)
):
    notification = update_notification(
        db,
        notification_id,
        creator_id,
        notification_data
    )

    if not notification:
        raise HTTPException(
            status_code=404,
            detail="Notification not found"
        )

    return notification


@router.delete(
    "/{notification_id}"
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

    return {
        "message": "Notification deleted successfully"
    }


# =========================================================
# ALERT APIs
# =========================================================

@router.post(
    "/alerts/performance/{creator_id}",
    response_model=NotificationResponse
)
def performance_alert(
    creator_id: int,
    db: Session = Depends(get_db)
):
    notification = generate_performance_alert(
        db,
        creator_id
    )

    if not notification:
        raise HTTPException(
            status_code=404,
            detail="No content available for performance analysis"
        )

    return notification


@router.post(
    "/alerts/engagement/{creator_id}",
    response_model=NotificationResponse
)
def engagement_alert(
    creator_id: int,
    db: Session = Depends(get_db)
):
    return generate_engagement_notification(
        db,
        creator_id
    )


@router.post(
    "/alerts/revenue/{creator_id}",
    response_model=NotificationResponse
)
def revenue_alert(
    creator_id: int,
    db: Session = Depends(get_db)
):
    return generate_revenue_alert(
        db,
        creator_id
    )