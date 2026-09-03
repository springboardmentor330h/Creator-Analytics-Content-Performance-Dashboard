from datetime import date
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.core.auth import get_current_user
from app.db.database import get_db
from app.schemas.content import (
    ContentAnalyticsResponse,
    ContentComparisonItem,
    ContentCreate,
    ContentListResponse,
    ContentResponse,
    ContentTrendPoint,
    ContentUpdate,
)
from app.services.content_service import (
    can_create_content,
    can_modify_content,
    can_view_content,
    compare_content_records,
    create_content,
    delete_content,
    get_content_by_id,
    get_content_list,
    get_summary_metrics,
    get_top_performing_content,
    get_trend_data,
    update_content,
)

router = APIRouter(prefix='/content', tags=['content'])


@router.post('', response_model=ContentResponse, status_code=status.HTTP_201_CREATED)
@router.post('/', response_model=ContentResponse, status_code=status.HTTP_201_CREATED, include_in_schema=False)
def create_content_item(
    payload: ContentCreate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    if not can_create_content(current_user):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail='Forbidden')
    try:
        return create_content(db, current_user, payload)
    except PermissionError as exc:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=str(exc)) from exc
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc


@router.get('', response_model=ContentListResponse)
@router.get('/', response_model=ContentListResponse, include_in_schema=False)
def list_content(
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=100),
    platform: Optional[str] = None,
    content_type: Optional[str] = None,
    search: Optional[str] = None,
    sort_by: str = Query('views'),
    sort_order: str = Query('desc'),
    published_from: Optional[date] = None,
    published_to: Optional[date] = None,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    try:
        return get_content_list(
            db,
            current_user,
            page=page,
            page_size=page_size,
            platform=platform,
            content_type=content_type,
            search=search,
            sort_by=sort_by,
            sort_order=sort_order,
            published_from=published_from,
            published_to=published_to,
        )
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc


@router.get('/analytics/summary', response_model=ContentAnalyticsResponse)
def summary_metrics(db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    return get_summary_metrics(db, current_user)


@router.get('/analytics/top-performing', response_model=List[dict])
def top_performing(
    limit: int = Query(5, ge=1, le=50),
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    return get_top_performing_content(db, current_user, limit=limit)


@router.get('/analytics/trends', response_model=List[ContentTrendPoint])
def trends(db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    return get_trend_data(db, current_user)


@router.get('/compare', response_model=List[ContentComparisonItem])
def compare(
    ids: List[int] = Query(..., min_length=1),
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    try:
        return compare_content_records(db, current_user, ids)
    except PermissionError as exc:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=str(exc)) from exc
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc


@router.get('/{content_id}', response_model=ContentResponse)
def get_content(content_id: int, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    content = get_content_by_id(db, content_id)
    if content is None or not can_view_content(current_user, content):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail='Content not found')
    return content


@router.put('/{content_id}', response_model=ContentResponse)
def update_content_item(
    content_id: int,
    payload: ContentUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    content = get_content_by_id(db, content_id)
    if content is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail='Content not found')
    if not can_modify_content(current_user, content):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail='Forbidden')
    try:
        return update_content(db, content, payload)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc


@router.delete('/{content_id}')
def remove_content(content_id: int, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    content = get_content_by_id(db, content_id)
    if content is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail='Content not found')
    if not can_modify_content(current_user, content):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail='Forbidden')
    delete_content(db, content)
    return {'success': True, 'message': 'Content deleted successfully'}
