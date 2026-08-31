import random
from typing import Dict, Any
from fastapi import APIRouter, Depends, Query, HTTPException
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.models.content import Content
from app.models.user import User
from app.services.analytics_service import AnalyticsService
from app.services.social_media import SocialMediaService

router = APIRouter(prefix="/analytics", tags=["Dashboard Analytics"])


class DynamicVideoInput(BaseModel):
    title: str = Field(..., min_length=1)
    views: int = Field(default=0, ge=0)
    likes: int = Field(default=0, ge=0)
    comments: int = Field(default=0, ge=0)
    shares: int = Field(default=0, ge=0)
    reach: int = Field(default=0, ge=0)


class DynamicChannelInput(BaseModel):
    channel_name: str = Field(..., min_length=1)
    platform: str = Field(..., min_length=1)
    videos: list[DynamicVideoInput] = Field(default_factory=list)


def _ensure_demo_creator_and_content(db: Session, creator_id: int) -> None:
    creator = db.query(User).filter(User.id == creator_id).first()
    if not creator:
        creator = User(
            id=creator_id,
            email=f"demo{creator_id}@creatoriq.com",
            full_name="Demo Creator",
            hashed_password="placeholder",
            is_active=True,
        )
        db.add(creator)
        db.commit()
        db.refresh(creator)

    if db.query(Content).filter(Content.creator_id == creator_id).first():
        return

    for platform in ["YouTube", "Instagram"]:
        for item in SocialMediaService.generate_mock_platform_data(platform):
            db.add(
                Content(
                    creator_id=creator_id,
                    platform=platform,
                    external_content_id=f"{platform.lower()}_{item['content_title'].lower().replace(' ', '_')}_{random.randint(1000, 9999)}",
                    content_title=item["content_title"],
                    views=item["views"],
                    likes=item["likes"],
                    comments=item["comments"],
                    shares=item["shares"],
                    saves=item.get("saves", 0),
                    watch_time=item.get("watch_time", 0.0),
                    reach=item["reach"],
                    published_date=item["published_date"],
                )
            )
    db.commit()


def _verify_creator_exists(db: Session, creator_id: int) -> None:
    """Helper function to check if a creator exists before running queries."""
    _ensure_demo_creator_and_content(db, creator_id)
    creator = db.query(User).filter(User.id == creator_id).first()
    if not creator:
        raise HTTPException(
            status_code=404,
            detail=f"Creator with id {creator_id} not found",
        )


@router.post(
    "/dynamic",
    summary="Calculate metrics from user-entered channel and video data",
    description="Accepts a channel name, platform, and list of videos to compute summary analytics without relying on seed data.",
)
def get_dynamic_channel_summary(payload: DynamicChannelInput) -> Dict[str, Any]:
    if not payload.videos:
        raise HTTPException(status_code=400, detail="Please add at least one video entry to calculate stats.")

    total_views = sum(video.views for video in payload.videos)
    total_likes = sum(video.likes for video in payload.videos)
    total_comments = sum(video.comments for video in payload.videos)
    total_shares = sum(video.shares for video in payload.videos)
    total_reach = sum(video.reach for video in payload.videos)

    total_interactions = total_likes + total_comments + total_shares
    avg_engagement = round((total_interactions / total_reach) * 100, 2) if total_reach else 0.0
    top_video = max(payload.videos, key=lambda video: video.views)

    return {
        "channel_name": payload.channel_name,
        "platform": payload.platform,
        "video_count": len(payload.videos),
        "top_video": top_video.title,
        "total_views": total_views,
        "total_likes": total_likes,
        "total_comments": total_comments,
        "total_shares": total_shares,
        "total_reach": total_reach,
        "total_followers": 0,
        "average_engagement_rate": avg_engagement,
        "videos": [
            {
                "title": video.title,
                "views": video.views,
                "likes": video.likes,
                "comments": video.comments,
                "shares": video.shares,
                "reach": video.reach,
            }
            for video in payload.videos
        ],
    }


@router.get(
    "/summary",
    summary="Get KPI Summary",
    description="Retrieves total views, likes, reach, and average engagement rate for a creator.",
)
def get_kpi_summary(
    creator_id: int = Query(6, description="Creator ID to fetch stats for"),
    platform: str = Query("All", description="Optional platform filter: All, YouTube, Instagram"),
    db: Session = Depends(get_db),
) -> Dict[str, Any]:
    _verify_creator_exists(db, creator_id)
    return AnalyticsService.get_kpi_summary(db, creator_id=creator_id, platform=platform)


@router.get(
    "/engagement-chart",
    summary="Get Engagement Rate Over Time",
    description="Returns dates and corresponding engagement rates for line chart display.",
)
def get_engagement_chart_data(
    creator_id: int = Query(6, description="Creator ID to fetch stats for"),
    db: Session = Depends(get_db),
) -> Dict[str, Any]:
    _verify_creator_exists(db, creator_id)
    return AnalyticsService.get_engagement_chart_data(db, creator_id=creator_id)


@router.get(
    "/follower-growth-chart",
    summary="Get Follower Growth Over Time",
    description="Returns dates and follower count trends for visual tracking.",
)
def get_follower_growth_chart_data(
    creator_id: int = Query(6, description="Creator ID to fetch stats for"),
    db: Session = Depends(get_db),
) -> Dict[str, Any]:
    _verify_creator_exists(db, creator_id)
    return AnalyticsService.get_follower_growth_chart_data(db, creator_id=creator_id)


@router.get(
    "/platform-comparison",
    summary="Get Multi-Platform Breakdown",
    description="Returns comparative engagement and view counts aggregated by social platform.",
)
def get_platform_comparison(
    creator_id: int = Query(6, description="Creator ID to fetch stats for"),
    platform: str = Query("All", description="Optional platform filter: All, YouTube, Instagram"),
    db: Session = Depends(get_db),
) -> Dict[str, Any]:
    _verify_creator_exists(db, creator_id)
    return AnalyticsService.get_platform_comparison(db, creator_id=creator_id, platform=platform)