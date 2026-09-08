from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.core.security import get_current_user
from app.schemas.audience import AudienceCreate, AudienceResponse, AudienceUpdate
from app.services.audience_service import AudienceService

router = APIRouter(tags=["Audience & Growth Analytics"])


# --- Audience CRUD APIs ---


@router.post(
    "/audience",
    response_model=AudienceResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_audience(data: AudienceCreate, current_user_id: str = Depends(get_current_user), db: Session = Depends(get_db)):
    """1. Create audience record"""
    return AudienceService.create_audience(db, data.model_copy(update={"creator_id": int(current_user_id)}))


@router.get("/audience", response_model=List[AudienceResponse])
def get_all_audience(current_user_id: str = Depends(get_current_user), db: Session = Depends(get_db)):
    """2. Get all audience records"""
    return AudienceService.get_all_audience(db, int(current_user_id))


@router.get("/audience/{audience_id}", response_model=AudienceResponse)
def get_audience_by_id(audience_id: int, current_user_id: str = Depends(get_current_user), db: Session = Depends(get_db)):
    """3. Get audience record by ID"""
    record = AudienceService.get_audience_by_id(db, audience_id)
    if record and record.creator_id != int(current_user_id):
        record = None
    if not record:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Audience record with id {audience_id} not found",
        )
    return record


@router.put("/audience/{audience_id}", response_model=AudienceResponse)
def update_audience(
    audience_id: int, data: AudienceUpdate, current_user_id: str = Depends(get_current_user), db: Session = Depends(get_db)
):
    """4. Update audience record"""
    record = AudienceService.update_audience(db, audience_id, data, int(current_user_id))
    if not record:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Audience record with id {audience_id} not found",
        )
    return record


@router.delete("/audience/{audience_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_audience(audience_id: int, current_user_id: str = Depends(get_current_user), db: Session = Depends(get_db)):
    """5. Delete audience record"""
    success = AudienceService.delete_audience(db, audience_id, int(current_user_id))
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Audience record with id {audience_id} not found",
        )
    return None


# --- Audience Analytics APIs ---


@router.get("/analytics/audience")
def get_audience_analytics(current_user_id: str = Depends(get_current_user), db: Session = Depends(get_db)):
    """6. Audience analytics report"""
    return AudienceService.get_audience_analytics(db, int(current_user_id))


@router.get("/analytics/growth")
def get_growth_analytics(current_user_id: str = Depends(get_current_user), db: Session = Depends(get_db)):
    """7. Growth analytics report (30-day historical trend)"""
    return AudienceService.get_growth_analytics(db, int(current_user_id))


@router.get("/analytics/audience-trends")
def get_audience_trends(current_user_id: str = Depends(get_current_user), db: Session = Depends(get_db)):
    """8. Audience trends API (Chart-ready data)"""
    return AudienceService.get_audience_trends(db, int(current_user_id))