"""
Audience endpoints: demographics + growth tracking.
All scoped to the logged-in creator.
"""
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.core.deps import get_current_user
from app.models.user import User
from app.models.content import Platform
from app.schemas.audience import (
    AudienceDemographicCreate,
    AudienceDemographicResponse,
    DemographicBreakdown,
    GeographicBreakdown,
    AudienceGrowthCreate,
    AudienceGrowthResponse,
    GrowthSummary,
    AudienceKPISummary,
)
from app.services import audience_service

router = APIRouter(prefix="/api/audience", tags=["Audience"])


# ---------- Demographics ----------

@router.post(
    "/demographics", response_model=AudienceDemographicResponse, status_code=status.HTTP_201_CREATED
)
def create_demographic(
    data: AudienceDemographicCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return audience_service.create_demographic(db, current_user.id, data)


@router.get("/demographics", response_model=list[AudienceDemographicResponse])
def list_demographics(
    platform: Optional[Platform] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return audience_service.list_demographics(db, current_user.id, platform)


@router.get("/demographics/age-breakdown", response_model=list[DemographicBreakdown])
def get_age_breakdown(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return audience_service.get_age_breakdown(db, current_user.id)


@router.get("/demographics/gender-breakdown", response_model=list[DemographicBreakdown])
def get_gender_breakdown(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return audience_service.get_gender_breakdown(db, current_user.id)


@router.get("/demographics/geographic-breakdown", response_model=list[GeographicBreakdown])
def get_geographic_breakdown(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return audience_service.get_geographic_breakdown(db, current_user.id)


# ---------- Growth ----------

@router.post(
    "/growth", response_model=AudienceGrowthResponse, status_code=status.HTTP_201_CREATED
)
def create_growth_record(
    data: AudienceGrowthCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return audience_service.create_growth_record(db, current_user.id, data)


@router.get("/growth/trend", response_model=list[AudienceGrowthResponse])
def get_growth_trend(
    platform: Optional[Platform] = None,
    days: Optional[int] = Query(None, ge=1),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return audience_service.get_growth_trend(db, current_user.id, platform, days)


@router.get("/growth/summary", response_model=GrowthSummary)
def get_growth_summary(
    platform: Platform,
    days: int = Query(30, ge=1),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    summary = audience_service.get_growth_summary(db, current_user.id, platform, days)
    if summary is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"No growth data recorded for {platform.value}",
        )
    return summary


@router.get("/analytics/summary", response_model=AudienceKPISummary)
def get_audience_kpi_summary(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return audience_service.get_audience_kpi_summary(db, current_user.id)
