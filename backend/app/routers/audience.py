from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.audience import Audience
from app.schemas.audience import AudienceCreate, AudienceUpdate, AudienceResponse
from app.services import audience_service

router = APIRouter(tags=["Audience"])


# ---------- CRUD ----------

@router.post("/audience", response_model=AudienceResponse, status_code=status.HTTP_201_CREATED)
def create_audience(audience: AudienceCreate, db: Session = Depends(get_db)):
    new_audience = Audience(**audience.model_dump())
    db.add(new_audience)
    db.commit()
    db.refresh(new_audience)
    return new_audience


@router.get("/audience", response_model=List[AudienceResponse])
def get_all_audience(db: Session = Depends(get_db)):
    return db.query(Audience).all()


@router.get("/audience/{audience_id}", response_model=AudienceResponse)
def get_audience_by_id(audience_id: int, db: Session = Depends(get_db)):
    audience = db.query(Audience).filter(Audience.id == audience_id).first()
    if not audience:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Audience with id {audience_id} not found",
        )
    return audience


@router.put("/audience/{audience_id}", response_model=AudienceResponse)
def update_audience(audience_id: int, updates: AudienceUpdate, db: Session = Depends(get_db)):
    audience = db.query(Audience).filter(Audience.id == audience_id).first()
    if not audience:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Audience with id {audience_id} not found",
        )

    update_data = updates.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(audience, field, value)

    db.commit()
    db.refresh(audience)
    return audience


@router.delete("/audience/{audience_id}", status_code=status.HTTP_200_OK)
def delete_audience(audience_id: int, db: Session = Depends(get_db)):
    audience = db.query(Audience).filter(Audience.id == audience_id).first()
    if not audience:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Audience with id {audience_id} not found",
        )

    db.delete(audience)
    db.commit()
    return {"detail": f"Audience with id {audience_id} deleted successfully"}


# ---------- Analytics ----------

@router.get("/analytics/audience")
def audience_analytics_report(db: Session = Depends(get_db)):
    """
    Returns total followers/reach/impressions, gender and age distribution,
    and top country/city/device — all computed in audience_service.
    """
    return audience_service.get_audience_report(db)


@router.get("/analytics/growth")
def growth_analytics_report(db: Session = Depends(get_db)):
    """Returns up to 30 days of growth history with daily growth and growth %."""
    return audience_service.get_growth_report(db)


@router.get("/analytics/audience-trends")
def audience_trends(db: Session = Depends(get_db)):
    """Returns chart-ready date/followers/reach series."""
    return audience_service.get_audience_trends(db)