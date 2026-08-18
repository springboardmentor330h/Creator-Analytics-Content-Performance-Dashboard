from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional

from backend.app.db.database import get_db
from backend.app.models.audience import Audience
from backend.app.models.growth import Growth
from backend.app.schemas.audience import AudienceCreate, AudienceUpdate, AudienceResponse
from backend.app.schemas.growth import GrowthCreate, GrowthUpdate, GrowthResponse
from backend.app.services.audience_service import AudienceService

router = APIRouter(
    tags=["Audience & Growth Analytics"]
)


@router.post("/audience", response_model=AudienceResponse, status_code=status.HTTP_201_CREATED)
@router.post("/audience/", response_model=AudienceResponse, status_code=status.HTTP_201_CREATED)
def create_audience(audience: AudienceCreate, db: Session = Depends(get_db)):
    db_audience = Audience(
        creator_id=audience.creator_id,
        age_group=audience.age_group,
        gender=audience.gender,
        country=audience.country,
        city=audience.city,
        device_type=audience.device_type,
        active_hour=audience.active_hour,
        followers=audience.followers,
        impressions=audience.impressions,
        reach=audience.reach
    )
    db.add(db_audience)
    db.commit()
    db.refresh(db_audience)
    return db_audience


@router.get("/audience", response_model=List[AudienceResponse])
@router.get("/audience/", response_model=List[AudienceResponse])
def get_all_audience(creator_id: Optional[int] = None, db: Session = Depends(get_db)):
    query = db.query(Audience)
    if creator_id is not None:
        query = query.filter(Audience.creator_id == creator_id)
    return query.all()


@router.get("/audience/{audience_id}", response_model=AudienceResponse)
def get_audience_by_id(audience_id: int, db: Session = Depends(get_db)):
    audience = db.query(Audience).filter(Audience.id == audience_id).first()
    if not audience:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Audience record not found"
        )
    return audience


@router.put("/audience/{audience_id}", response_model=AudienceResponse)
def update_audience(audience_id: int, audience_update: AudienceUpdate, db: Session = Depends(get_db)):
    db_audience = db.query(Audience).filter(Audience.id == audience_id).first()
    if not db_audience:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Audience record not found"
        )

    update_data = audience_update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_audience, key, value)

    db.commit()
    db.refresh(db_audience)
    return db_audience


@router.delete("/audience/{audience_id}")
def delete_audience(audience_id: int, db: Session = Depends(get_db)):
    db_audience = db.query(Audience).filter(Audience.id == audience_id).first()
    if not db_audience:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Audience record not found"
        )

    db.delete(db_audience)
    db.commit()
    return {"message": "Audience record deleted successfully"}


@router.get("/analytics/audience")
@router.get("/analytics/audience/")
def get_audience_analytics(creator_id: Optional[int] = None, db: Session = Depends(get_db)):
    return AudienceService.get_audience_report(db, creator_id=creator_id)


@router.get("/analytics/growth")
@router.get("/analytics/growth/")
def get_growth_analytics(creator_id: Optional[int] = None, platform: Optional[str] = None, limit: int = 30, db: Session = Depends(get_db)):
    return AudienceService.growth_trend_generation(db, creator_id=creator_id, platform=platform, limit=limit)


@router.get("/analytics/audience-trends")
@router.get("/analytics/audience-trends/")
def get_audience_trends(creator_id: Optional[int] = None, platform: Optional[str] = None, db: Session = Depends(get_db)):
    return AudienceService.get_audience_trends(db, creator_id=creator_id, platform=platform)



@router.post("/growth", response_model=GrowthResponse, status_code=status.HTTP_201_CREATED)
@router.post("/growth/", response_model=GrowthResponse, status_code=status.HTTP_201_CREATED)
def create_growth(growth: GrowthCreate, db: Session = Depends(get_db)):
    db_growth = Growth(
        creator_id=growth.creator_id,
        platform=growth.platform or "All",
        date=growth.date,
        followers=growth.followers,
        reach=growth.reach,
        engagement_rate=growth.engagement_rate
    )
    db.add(db_growth)
    db.commit()
    db.refresh(db_growth)
    return db_growth


@router.get("/growth", response_model=List[GrowthResponse])
@router.get("/growth/", response_model=List[GrowthResponse])
def get_all_growth(creator_id: Optional[int] = None, db: Session = Depends(get_db)):
    query = db.query(Growth)
    if creator_id is not None:
        query = query.filter(Growth.creator_id == creator_id)
    return query.all()
