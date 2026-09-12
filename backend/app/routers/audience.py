"""
Audience & Growth Router module.
Provides API endpoints for audience demographics, device usage, locations, and growth trend breakdowns.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional

from backend.app.db.database import get_db
from backend.app.core.deps import get_current_user
from backend.app.models.user import User
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
def create_audience(
    audience: AudienceCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    db_audience = Audience(
        creator_id=current_user.id,
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
def get_all_audience(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(Audience).filter(Audience.creator_id == current_user.id)
    return query.all()


@router.get("/audience/{audience_id}", response_model=AudienceResponse)
def get_audience_by_id(
    audience_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    audience = db.query(Audience).filter(
        Audience.id == audience_id,
        Audience.creator_id == current_user.id
    ).first()
    if not audience:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Audience record not found"
        )
    return audience


@router.put("/audience/{audience_id}", response_model=AudienceResponse)
def update_audience(
    audience_id: int,
    audience_update: AudienceUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    db_audience = db.query(Audience).filter(
        Audience.id == audience_id,
        Audience.creator_id == current_user.id
    ).first()
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
def delete_audience(
    audience_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    db_audience = db.query(Audience).filter(
        Audience.id == audience_id,
        Audience.creator_id == current_user.id
    ).first()
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
def get_audience_analytics(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return AudienceService.get_audience_report(db, creator_id=current_user.id)


@router.get("/analytics/growth")
@router.get("/analytics/growth/")
def get_growth_analytics(
    platform: Optional[str] = None,
    limit: int = 30,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return AudienceService.growth_trend_generation(db, creator_id=current_user.id, platform=platform, limit=limit)


@router.get("/analytics/audience-trends")
@router.get("/analytics/audience-trends/")
def get_audience_trends(
    platform: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return AudienceService.get_audience_trends(db, creator_id=current_user.id, platform=platform)
