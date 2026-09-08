"""
Multi-platform analytics endpoints — normalized comparison across
YouTube (real data), Instagram, and TikTok (mock data until integrated).
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.core.deps import get_current_user
from app.models.user import User
from app.models.content import Platform
from app.schemas.platform_analytics import (
    PlatformSnapshot,
    CrossPlatformKPIs,
    PlatformGrowthComparisonPoint,
    PlatformEngagementComparisonPoint,
)
from app.services import platform_analytics_service

router = APIRouter(prefix="/api/platforms", tags=["Multi-Platform Analytics"])


@router.get("/summary", response_model=CrossPlatformKPIs)
def get_cross_platform_summary(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return platform_analytics_service.get_cross_platform_kpis(db, current_user.id)


@router.get("/comparison", response_model=list[PlatformSnapshot])
def get_platform_comparison(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return platform_analytics_service.get_all_platform_snapshots(db, current_user.id)


@router.get("/growth-comparison", response_model=list[PlatformGrowthComparisonPoint])
def get_growth_comparison(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return platform_analytics_service.get_growth_comparison(db, current_user.id)


@router.get("/engagement-comparison", response_model=list[PlatformEngagementComparisonPoint])
def get_engagement_comparison(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return platform_analytics_service.get_engagement_comparison(db, current_user.id)


@router.get("/{platform}", response_model=PlatformSnapshot)
def get_single_platform_snapshot(
    platform: Platform,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return platform_analytics_service.get_platform_snapshot(db, current_user.id, platform)
