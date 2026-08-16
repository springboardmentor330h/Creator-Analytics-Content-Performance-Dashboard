from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.auth import get_current_user
from app.db.database import get_db
from app.models.user import User
from app.schemas.audience import (
    AudienceAnalyticsResponse,
    AudienceCreate,
    AudienceResponse,
    AudienceUpdate,
)
from app.schemas.growth import (
    AudienceTrendPoint,
    GrowthAnalyticsPoint,
    GrowthCreate,
    GrowthResponse,
)
from app.services.audience_service import (
    can_modify_audience,
    can_view_audience,
    create_audience,
    create_growth,
    delete_audience,
    get_audience_analytics,
    get_audience_by_id,
    get_audience_list,
    get_audience_trends,
    get_growth_analytics,
    update_audience,
)

router = APIRouter(tags=['audience'])


# ------------------------------
# AUDIENCE ANALYTICS ENDPOINTS
# ------------------------------

@router.get('/analytics/audience', response_model=AudienceAnalyticsResponse)
@router.get('/api/analytics/audience', response_model=AudienceAnalyticsResponse, include_in_schema=False)
def analytics_audience(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return get_audience_analytics(db, current_user)


@router.get('/analytics/growth', response_model=List[GrowthAnalyticsPoint])
@router.get('/api/analytics/growth', response_model=List[GrowthAnalyticsPoint], include_in_schema=False)
def analytics_growth(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return get_growth_analytics(db, current_user)


@router.get('/analytics/audience-trends', response_model=List[AudienceTrendPoint])
@router.get('/api/analytics/audience-trends', response_model=List[AudienceTrendPoint], include_in_schema=False)
def analytics_audience_trends(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return get_audience_trends(db, current_user)


# ------------------------------
# AUDIENCE CRUD ENDPOINTS
# ------------------------------

@router.post('/audience', response_model=AudienceResponse, status_code=status.HTTP_201_CREATED)
@router.post('/api/audience', response_model=AudienceResponse, status_code=status.HTTP_201_CREATED, include_in_schema=False)
def create_audience_record(
    payload: AudienceCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return create_audience(db, current_user, payload)


@router.get('/audience', response_model=List[AudienceResponse])
@router.get('/api/audience', response_model=List[AudienceResponse], include_in_schema=False)
def list_audience_records(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return get_audience_list(db, current_user)


@router.get('/audience/{id}', response_model=AudienceResponse)
@router.get('/api/audience/{id}', response_model=AudienceResponse, include_in_schema=False)
def get_audience_record(
    id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    record = get_audience_by_id(db, id)
    if record is None or not can_view_audience(current_user, record):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail='Audience record not found')
    return record


@router.put('/audience/{id}', response_model=AudienceResponse)
@router.put('/api/audience/{id}', response_model=AudienceResponse, include_in_schema=False)
def update_audience_record(
    id: int,
    payload: AudienceUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    record = get_audience_by_id(db, id)
    if record is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail='Audience record not found')
    if not can_modify_audience(current_user, record):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail='Forbidden')
    return update_audience(db, record, payload)


@router.delete('/audience/{id}')
@router.delete('/api/audience/{id}', include_in_schema=False)
def delete_audience_record(
    id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    record = get_audience_by_id(db, id)
    if record is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail='Audience record not found')
    if not can_modify_audience(current_user, record):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail='Forbidden')
    delete_audience(db, record)
    return {'success': True, 'message': 'Audience record deleted successfully'}


# ------------------------------
# GROWTH ENDPOINTS (HELPERS)
# ------------------------------

@router.post('/growth', response_model=GrowthResponse, status_code=status.HTTP_201_CREATED)
@router.post('/api/growth', response_model=GrowthResponse, status_code=status.HTTP_201_CREATED, include_in_schema=False)
def create_growth_record(
    payload: GrowthCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return create_growth(db, current_user, payload)
