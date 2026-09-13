from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.models.revenue import Revenue
from app.models.sponsorship import Sponsorship
from app.schemas.revenue import RevenueCreate, RevenueUpdate, RevenueResponse
from app.schemas.sponsorship import SponsorshipCreate, SponsorshipUpdate, SponsorshipResponse
from app.services.revenue_service import summary

router=APIRouter(prefix="/revenue",tags=["Revenue"])

@router.get("/analytics/summary")
def revenue_summary(db:Session=Depends(get_db)): return summary(db)

@router.post("",response_model=RevenueResponse,status_code=201)
def create_revenue(data:RevenueCreate,db:Session=Depends(get_db)):
    o=Revenue(**data.model_dump()); db.add(o); db.commit(); db.refresh(o); return o

@router.get("",response_model=List[RevenueResponse])
def get_revenue(creator_id:Optional[int]=None,db:Session=Depends(get_db)):
    q=db.query(Revenue)
    if creator_id: q=q.filter(Revenue.creator_id==creator_id)
    return q.order_by(Revenue.received_date.desc()).all()

@router.get("/sponsorships",response_model=List[SponsorshipResponse])
def get_sponsorships(creator_id:Optional[int]=None,db:Session=Depends(get_db)):
    q=db.query(Sponsorship)
    if creator_id: q=q.filter(Sponsorship.creator_id==creator_id)
    return q.order_by(Sponsorship.id.desc()).all()

@router.post("/sponsorships",response_model=SponsorshipResponse,status_code=201)
def create_sponsorship(data:SponsorshipCreate,db:Session=Depends(get_db)):
    o=Sponsorship(**data.model_dump()); db.add(o); db.commit(); db.refresh(o); return o

@router.get("/sponsorships/{sponsorship_id}",response_model=SponsorshipResponse)
def get_sponsorship(sponsorship_id:int,db:Session=Depends(get_db)):
    o=db.query(Sponsorship).filter(Sponsorship.id==sponsorship_id).first()
    if not o: raise HTTPException(404,"Sponsorship not found")
    return o

@router.put("/sponsorships/{sponsorship_id}",response_model=SponsorshipResponse)
def update_sponsorship(sponsorship_id:int,data:SponsorshipUpdate,db:Session=Depends(get_db)):
    o=db.query(Sponsorship).filter(Sponsorship.id==sponsorship_id).first()
    if not o: raise HTTPException(404,"Sponsorship not found")
    for k,v in data.model_dump(exclude_unset=True).items(): setattr(o,k,v)
    db.commit(); db.refresh(o); return o

@router.delete("/sponsorships/{sponsorship_id}")
def delete_sponsorship(sponsorship_id:int,db:Session=Depends(get_db)):
    o=db.query(Sponsorship).filter(Sponsorship.id==sponsorship_id).first()
    if not o: raise HTTPException(404,"Sponsorship not found")
    db.delete(o); db.commit(); return {"message":"Sponsorship deleted successfully"}
@router.get("/{revenue_id}",response_model=RevenueResponse)
def get_revenue_id(revenue_id:int,db:Session=Depends(get_db)):
    o=db.query(Revenue).filter(Revenue.id==revenue_id).first()
    if not o: raise HTTPException(404,"Revenue not found")
    return o

@router.put("/{revenue_id}",response_model=RevenueResponse)
def update_revenue(revenue_id:int,data:RevenueUpdate,db:Session=Depends(get_db)):
    o=db.query(Revenue).filter(Revenue.id==revenue_id).first()
    if not o: raise HTTPException(404,"Revenue not found")
    for k,v in data.model_dump(exclude_unset=True).items(): setattr(o,k,v)
    db.commit(); db.refresh(o); return o

@router.delete("/{revenue_id}")
def delete_revenue(revenue_id:int,db:Session=Depends(get_db)):
    o=db.query(Revenue).filter(Revenue.id==revenue_id).first()
    if not o: raise HTTPException(404,"Revenue not found")
    db.delete(o); db.commit(); return {"message":"Revenue deleted successfully"}

