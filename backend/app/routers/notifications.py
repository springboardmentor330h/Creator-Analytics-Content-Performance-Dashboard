from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas.notification import NotificationOut, NotificationCountOut
from app.services import notification_service as svc
from app.core.deps import get_current_user, verify_creator_access
from app.services.access_service import get_allowed_creator_ids

router = APIRouter(prefix="/notifications", tags=["notifications"])


@router.post("/generate/{creator_id}")
def generate_notifications(creator_id: int = Depends(verify_creator_access), db: Session = Depends(get_db)):
    perf = svc.generate_performance_alerts(db, creator_id)
    rev = svc.generate_revenue_alerts(db, creator_id)
    return {"performance_alerts_created": len(perf), "revenue_alerts_created": len(rev)}


@router.get("/creator/{creator_id}", response_model=list[NotificationOut])
def list_notifications(creator_id: int = Depends(verify_creator_access), unread_only: bool = Query(False),
                        db: Session = Depends(get_db)):
    return svc.get_notifications(db, creator_id, unread_only)


@router.get("/creator/{creator_id}/count", response_model=NotificationCountOut)
def notification_counts(creator_id: int = Depends(verify_creator_access), db: Session = Depends(get_db)):
    return svc.get_notification_counts(db, creator_id)


@router.put("/{notification_id}/read", response_model=NotificationOut)
def mark_read(notification_id: int, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    notif = svc.mark_as_read(db, notification_id)
    if not notif:
        raise HTTPException(status_code=404, detail="Notification not found")
    allowed = get_allowed_creator_ids(db, current_user)
    if allowed is not None and notif.creator_id not in allowed:
        raise HTTPException(status_code=403, detail="You do not have access to this notification")
    return notif


@router.put("/creator/{creator_id}/read-all")
def mark_all_read(creator_id: int = Depends(verify_creator_access), db: Session = Depends(get_db)):
    count = svc.mark_all_as_read(db, creator_id)
    return {"message": f"Marked {count} notifications as read"}