from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.services import notification_service as svc

router = APIRouter(prefix="/notifications", tags=["notifications"])


@router.get("/performance-alerts/{creator_id}")
def performance_alerts(creator_id: int, db: Session = Depends(get_db)):
    return svc.performance_alerts(db, creator_id)


@router.get("/revenue-alerts/{creator_id}")
def revenue_alerts(creator_id: int, db: Session = Depends(get_db)):
    return svc.revenue_alerts(db, creator_id)


@router.get("/weekly-report/{creator_id}")
def weekly_report(creator_id: int, db: Session = Depends(get_db)):
    return svc.weekly_report(db, creator_id)