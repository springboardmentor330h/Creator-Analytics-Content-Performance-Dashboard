from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.content import ContentItem
from app.schemas.content import (
    ContentSyncRequest, ContentItemOut, ContentAnalyticsSummary,
    ContentComparisonRequest, TrendPoint,
)
from app.services import youtube_service
from app.core.deps import get_current_user
from app.models.user import User

router = APIRouter(prefix="/content", tags=["content-analytics"])


def parse_dt(value):
    if not value:
        return None
    return datetime.fromisoformat(value.replace("Z", "+00:00"))


def compute_engagement_rate(item: ContentItem) -> float:
    if item.views == 0:
        return 0.0
    return round(((item.likes + item.comments + item.shares) / item.views) * 100, 2)


def to_out(item: ContentItem) -> dict:
    return {
        "id": item.id,
        "video_id": item.video_id,
        "title": item.title,
        "channel_title": item.channel_title,
        "thumbnail_url": item.thumbnail_url,
        "published_at": item.published_at,
        "views": item.views,
        "likes": item.likes,
        "comments": item.comments,
        "shares": item.shares,
        "saves": item.saves,
        "watch_time_minutes": item.watch_time_minutes,
        "engagement_rate": compute_engagement_rate(item),
        "reach": item.views,  # approximation: reach ≈ views (true reach needs Analytics API)
    }


@router.post("/sync", response_model=list[ContentItemOut])
def sync_content(payload: ContentSyncRequest, db: Session = Depends(get_db),
                  current_user: User = Depends(get_current_user)):
    if payload.channel_id:
        video_data = youtube_service.get_channel_videos(payload.channel_id, payload.max_results)
    elif payload.search_query:
        video_ids = youtube_service.search_videos(payload.search_query, payload.max_results)
        video_data = youtube_service.get_video_stats(video_ids)
    else:
        raise HTTPException(status_code=400, detail="Provide either channel_id or search_query")

    saved_items = []
    for v in video_data:
        existing = db.query(ContentItem).filter(ContentItem.video_id == v["video_id"]).first()
        if existing:
            existing.views = v["views"]
            existing.likes = v["likes"]
            existing.comments = v["comments"]
            db.commit()
            db.refresh(existing)
            saved_items.append(existing)
        else:
            new_item = ContentItem(
                owner_id=current_user.id,
                video_id=v["video_id"],
                title=v["title"],
                channel_title=v["channel_title"],
                thumbnail_url=v["thumbnail_url"],
                published_at=parse_dt(v["published_at"]),
                views=v["views"],
                likes=v["likes"],
                comments=v["comments"],
            )
            db.add(new_item)
            db.commit()
            db.refresh(new_item)
            saved_items.append(new_item)

    return [to_out(i) for i in saved_items]


@router.get("/", response_model=list[ContentItemOut])
def list_content(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    items = db.query(ContentItem).filter(ContentItem.owner_id == current_user.id).all()
    return [to_out(i) for i in items]


@router.get("/summary", response_model=ContentAnalyticsSummary)
def content_summary(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    items = db.query(ContentItem).filter(ContentItem.owner_id == current_user.id).all()
    if not items:
        return ContentAnalyticsSummary(
            total_videos=0, total_views=0, total_likes=0, total_comments=0,
            total_reach=0, avg_engagement_rate=0.0, top_video=None,
        )
    total_views = sum(i.views for i in items)
    total_likes = sum(i.likes for i in items)
    total_comments = sum(i.comments for i in items)
    engagement = ((total_likes + total_comments) / total_views * 100) if total_views > 0 else 0.0
    top_video = max(items, key=lambda i: i.views)

    return ContentAnalyticsSummary(
        total_videos=len(items),
        total_views=total_views,
        total_likes=total_likes,
        total_comments=total_comments,
        total_reach=total_views,
        avg_engagement_rate=round(engagement, 2),
        top_video=to_out(top_video),
    )


@router.get("/top-performing", response_model=list[ContentItemOut])
def top_performing(limit: int = 5, db: Session = Depends(get_db),
                    current_user: User = Depends(get_current_user)):
    items = (
        db.query(ContentItem)
        .filter(ContentItem.owner_id == current_user.id)
        .order_by(ContentItem.views.desc())
        .limit(limit)
        .all()
    )
    return [to_out(i) for i in items]


@router.post("/compare", response_model=list[ContentItemOut])
def compare_content(payload: ContentComparisonRequest, db: Session = Depends(get_db),
                     current_user: User = Depends(get_current_user)):
    items = (
        db.query(ContentItem)
        .filter(ContentItem.owner_id == current_user.id, ContentItem.id.in_(payload.video_ids))
        .all()
    )
    if not items:
        raise HTTPException(status_code=404, detail="No matching content found")
    return [to_out(i) for i in items]


@router.get("/trends", response_model=list[TrendPoint])
def performance_trends(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """
    Groups content by publish date to show a simple trend line.
    Note: true day-by-day historical trend requires re-syncing over time
    and storing snapshots; this shows trend based on publish dates for now.
    """
    items = (
        db.query(ContentItem)
        .filter(ContentItem.owner_id == current_user.id)
        .order_by(ContentItem.published_at.asc())
        .all()
    )
    trend = []
    for item in items:
        if item.published_at:
            trend.append(TrendPoint(
                date=item.published_at.strftime("%Y-%m-%d"),
                views=item.views,
                likes=item.likes,
                comments=item.comments,
            ))
    return trend
