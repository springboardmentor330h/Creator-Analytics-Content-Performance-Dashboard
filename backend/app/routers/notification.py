from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.notification import Notification
from app.schemas.notification import NotificationCreate, NotificationUpdate, NotificationResponse
from app.services import notification_service

router = APIRouter(tags=["Notifications"])


@router.post("/notifications", response_model=NotificationResponse, status_code=status.HTTP_201_CREATED)
def create_notification(notification: NotificationCreate, db: Session = Depends(get_db)):
    new_notification = Notification(**notification.model_dump())
    db.add(new_notification)
    db.commit()
    db.refresh(new_notification)
    return new_notification


@router.get("/notifications", response_model=List[NotificationResponse])
def get_all_notifications(creator_id: int, unread_only: bool = False, db: Session = Depends(get_db)):
    query = db.query(Notification).filter(Notification.creator_id == creator_id)
    if unread_only:
        query = query.filter(Notification.is_read == False)  # noqa: E712
    return query.order_by(Notification.created_at.desc()).all()


@router.get("/notifications/{notification_id}", response_model=NotificationResponse)
def get_notification_by_id(notification_id: int, creator_id: int, db: Session = Depends(get_db)):
    notification = (
        db.query(Notification)
        .filter(Notification.id == notification_id, Notification.creator_id == creator_id)
        .first()
    )
    if not notification:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Notification with id {notification_id} not found")
    return notification


@router.put("/notifications/{notification_id}", response_model=NotificationResponse)
def update_notification(notification_id: int, creator_id: int, updates: NotificationUpdate, db: Session = Depends(get_db)):
    notification = (
        db.query(Notification)
        .filter(Notification.id == notification_id, Notification.creator_id == creator_id)
        .first()
    )
    if not notification:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Notification with id {notification_id} not found")

    update_data = updates.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(notification, field, value)

    db.commit()
    db.refresh(notification)
    return notification


@router.put("/notifications/{notification_id}/read", response_model=NotificationResponse)
def mark_as_read(notification_id: int, creator_id: int, db: Session = Depends(get_db)):
    notification = (
        db.query(Notification)
        .filter(Notification.id == notification_id, Notification.creator_id == creator_id)
        .first()
    )
    if not notification:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Notification with id {notification_id} not found")

    notification.is_read = True
    db.commit()
    db.refresh(notification)
    return notification


@router.delete("/notifications/{notification_id}", status_code=status.HTTP_200_OK)
def delete_notification(notification_id: int, creator_id: int, db: Session = Depends(get_db)):
    notification = (
        db.query(Notification)
        .filter(Notification.id == notification_id, Notification.creator_id == creator_id)
        .first()
    )
    if not notification:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Notification with id {notification_id} not found")

    db.delete(notification)
    db.commit()
    return {"detail": f"Notification with id {notification_id} deleted successfully"}


@router.post("/notifications/check-alerts")
def check_alerts(creator_id: int, db: Session = Depends(get_db)):
    return notification_service.run_all_alert_checks(db, creator_id)