"""
Content endpoints — CRUD plus analytics.
All routes are scoped to the logged-in creator (current_user.id) —
nobody can see or edit another creator's content through this API.
"""
import uuid
from datetime import datetime
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.core.deps import get_current_user
from app.models.user import User
from app.models.content import Platform
from app.schemas.content import (
    ContentCreate,
    ContentUpdate,
    ContentResponse,
    ContentListResponse,
    PlatformComparisonItem,
    KPISummary,
)
from app.services import content_service

router = APIRouter(prefix="/api/content", tags=["Content"])


@router.post("/", response_model=ContentResponse, status_code=status.HTTP_201_CREATED)
def create_content(
    content_in: ContentCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    content = content_service.create_content(db, current_user.id, content_in)
    return content_service.to_response_dict(content)


@router.get("/", response_model=ContentListResponse)
def list_content(
    platform: Optional[Platform] = None,
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None,
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    items, total = content_service.list_content(
        db, current_user.id, platform, start_date, end_date, skip, limit
    )
    return {
        "total": total,
        "items": [content_service.to_response_dict(c) for c in items],
    }


@router.get("/analytics/summary", response_model=KPISummary)
def get_kpi_summary(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return content_service.get_kpi_summary(db, current_user.id)


@router.get("/analytics/top-performing", response_model=list[ContentResponse])
def get_top_performing(
    limit: int = Query(5, ge=1, le=20),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    top = content_service.get_top_performing_content(db, current_user.id, limit)
    return [content_service.to_response_dict(c) for c in top]


@router.get("/analytics/platform-comparison", response_model=list[PlatformComparisonItem])
def get_platform_comparison(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return content_service.get_platform_comparison(db, current_user.id)


@router.get("/{content_id}", response_model=ContentResponse)
def get_content(
    content_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    content = content_service.get_content_by_id(db, content_id, current_user.id)
    if not content:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Content not found")
    return content_service.to_response_dict(content)


@router.put("/{content_id}", response_model=ContentResponse)
def update_content(
    content_id: uuid.UUID,
    content_in: ContentUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    content = content_service.get_content_by_id(db, content_id, current_user.id)
    if not content:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Content not found")
    updated = content_service.update_content(db, content, content_in)
    return content_service.to_response_dict(updated)


@router.delete("/{content_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_content(
    content_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    content = content_service.get_content_by_id(db, content_id, current_user.id)
    if not content:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Content not found")
    content_service.delete_content(db, content)
