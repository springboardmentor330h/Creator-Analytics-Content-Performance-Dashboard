from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.schemas.audience import AudienceCreate, AudienceResponse, AudienceUpdate
from app.services.audience_service import AudienceService

router = APIRouter(tags=["Audience & Growth Analytics"])


# --- Audience CRUD APIs ---


@router.post(
    "/audience",
    response_model=AudienceResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_audience(data: AudienceCreate, db: Session = Depends(get_db)):
    """1. Create audience record"""
    return AudienceService.create_audience(db, data)


@router.get("/audience", response_model=List[AudienceResponse])
def get_all_audience(db: Session = Depends(get_db)):
    """2. Get all audience records"""
    return AudienceService.get_all_audience(db)


@router.get("/audience/{audience_id}", response_model=AudienceResponse)
def get_audience_by_id(audience_id: int, db: Session = Depends(get_db)):
    """3. Get audience record by ID"""
    record = AudienceService.get_audience_by_id(db, audience_id)
    if not record:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Audience record with id {audience_id} not found",
        )
    return record


@router.put("/audience/{audience_id}", response_model=AudienceResponse)
def update_audience(
    audience_id: int, data: AudienceUpdate, db: Session = Depends(get_db)
):
    """4. Update audience record"""
    record = AudienceService.update_audience(db, audience_id, data)
    if not record:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Audience record with id {audience_id} not found",
        )
    return record


@router.delete("/audience/{audience_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_audience(audience_id: int, db: Session = Depends(get_db)):
    """5. Delete audience record"""
    success = AudienceService.delete_audience(db, audience_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Audience record with id {audience_id} not found",
        )
    return None


# --- Audience Analytics APIs ---


@router.get("/analytics/audience")
def get_audience_analytics(db: Session = Depends(get_db)):
    """6. Audience analytics report"""
    return AudienceService.get_audience_analytics(db)


@router.get("/analytics/growth")
def get_growth_analytics(db: Session = Depends(get_db)):
    """7. Growth analytics report (30-day historical trend)"""
    return AudienceService.get_growth_analytics(db)


@router.get("/analytics/audience-trends")
def get_audience_trends(db: Session = Depends(get_db)):
    """8. Audience trends API (Chart-ready data)"""
    return AudienceService.get_audience_trends(db)