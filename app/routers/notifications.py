from typing import List
from fastapi import APIRouter,Depends,HTTPException
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.models.notification import Notification
from app.schemas.notification import NotificationCreate,NotificationUpdate
from app.services.analytics_service import kpi_summary
from app.services.revenue_service import summary as revenue_summary

router=APIRouter(prefix="/notifications",tags=["Notifications"])

@router.post("",status_code=201)
def create_notification(data:NotificationCreate,db:Session=Depends(get_db)):
    o=Notification(**data.model_dump()); db.add(o); db.commit(); db.refresh(o); return o
@router.get("")
def list_notifications(creator_id:int=1,db:Session=Depends(get_db)):
    return db.query(Notification).filter(Notification.creator_id==creator_id).order_by(Notification.created_at.desc()).all()
@router.put("/{notification_id}/read")
def mark_read(notification_id:int,db:Session=Depends(get_db)):
    o=db.query(Notification).filter(Notification.id==notification_id).first()
    if not o: raise HTTPException(404,"Notification not found")
    o.is_read=True; db.commit(); db.refresh(o); return o
@router.put("/{notification_id}")
def update_notification(notification_id:int,data:NotificationUpdate,db:Session=Depends(get_db)):
    o=db.query(Notification).filter(Notification.id==notification_id).first()
    if not o: raise HTTPException(404,"Notification not found")
    for k,v in data.model_dump(exclude_unset=True).items(): setattr(o,k,v)
    db.commit(); db.refresh(o); return o

@router.post("/generate")
def generate_alerts(creator_id:int=1,db:Session=Depends(get_db)):
    k=kpi_summary(db); r=revenue_summary(db); created=[]
    if k["average_engagement_rate"] >= 8:
        created.append(Notification(creator_id=creator_id,notification_type="engagement",title="High engagement",
            message=f"Average engagement reached {k['average_engagement_rate']}%."))
    if k["total_views"] >= 100000:
        created.append(Notification(creator_id=creator_id,notification_type="performance",title="Performance milestone",
            message=f"Total views reached {k['total_views']:,}."))
    if r["total_revenue"] >= 50000:
        created.append(Notification(creator_id=creator_id,notification_type="revenue",title="Revenue milestone",
            message=f"Total revenue reached ₹{r['total_revenue']:,.2f}."))
    db.add_all(created); db.commit()
    return {"alerts_created":len(created),"notifications":created}
