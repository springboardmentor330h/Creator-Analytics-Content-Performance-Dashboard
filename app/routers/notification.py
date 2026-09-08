from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.db.database import get_db
from app.core.security import get_current_user
from app.models.notification import Notification
from app.schemas.notification import NotificationResponse, NotificationCreate

router = APIRouter(prefix="/notifications", tags=["Notifications"])

@router.post("/", response_model=NotificationResponse, status_code=201)
def create_notification(notif: NotificationCreate, current_user_id: str = Depends(get_current_user), db: Session = Depends(get_db)):
    db_notif = Notification(**notif.model_dump(exclude={"creator_id"}), creator_id=int(current_user_id))
    db.add(db_notif)
    db.commit()
    db.refresh(db_notif)
    return db_notif

@router.get("/creator/{creator_id}", response_model=List[NotificationResponse])
def get_creator_notifications(creator_id: int, current_user_id: str = Depends(get_current_user), db: Session = Depends(get_db)):
    if creator_id != int(current_user_id):
        raise HTTPException(status_code=403, detail="You cannot access another creator's notifications")
    return db.query(Notification).filter(Notification.creator_id == creator_id).all()

@router.put("/{notification_id}/read", response_model=NotificationResponse)
def mark_as_read(notification_id: int, current_user_id: str = Depends(get_current_user), db: Session = Depends(get_db)):
    notif = db.query(Notification).filter(Notification.id == notification_id, Notification.creator_id == int(current_user_id)).first()
    if not notif:
        raise HTTPException(status_code=404, detail="Notification not found")
    notif.is_read = True
    db.commit()
    db.refresh(notif)
    return notif


@router.delete("/{notification_id}", status_code=204)
def delete_notification(notification_id: int, current_user_id: str = Depends(get_current_user), db: Session = Depends(get_db)):
    notif = db.query(Notification).filter(Notification.id == notification_id, Notification.creator_id == int(current_user_id)).first()
    if not notif:
        raise HTTPException(status_code=404, detail="Notification not found")
    db.delete(notif)
    db.commit()