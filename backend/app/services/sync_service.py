"""
Sync service — the bridge between YouTube's raw API shape and our
internal Content/AudienceGrowth tables.

DUPLICATE HANDLING: YouTube doesn't know about our `Content.id` — it
has its own video IDs. We store the YouTube video ID in `Content.title`
alongside... no, actually we need a dedicated column. See the migration
note below: we add `external_id` to Content so re-syncing the same
channel doesn't create duplicate rows every time — it UPDATES the
existing row's stats instead.

WHY not just always insert? A creator syncing daily would otherwise get
a new duplicate Content row per video, per day, forever. Real dashboards
sync repeatedly — idempotent sync (safe to run twice) is a baseline
requirement, not a nice-to-have.
"""
import uuid
from datetime import datetime, date
from typing import Optional
from sqlalchemy.orm import Session

from app.models.content import Content, Platform, ContentType
from app.models.audience import AudienceGrowth
from app.services.youtube_service import YouTubeService, YouTubeAPIError


async def sync_youtube_channel(
    db: Session, creator_id: uuid.UUID, channel_id: str, api_key: Optional[str] = None
) -> dict:
    """
    Full sync: channel stats -> AudienceGrowth record, recent videos ->
    Content records. Returns a summary dict so the caller/API response
    can report exactly what happened (useful for debugging a bad sync).
    """
    service = YouTubeService(api_key=api_key)

    try:
        channel_info = await service.get_channel_info(channel_id)
    except YouTubeAPIError as e:
        return {"success": False, "error": str(e), "videos_synced": 0, "videos_updated": 0}

    # 1. Record current follower (subscriber) count as a growth data point.
    _record_growth_snapshot(db, creator_id, channel_info["subscriber_count"])

    # 2. Fetch and sync recent videos.
    try:
        video_ids = await service.get_recent_video_ids(channel_info["uploads_playlist_id"])
    except YouTubeAPIError as e:
        return {
            "success": True,  # channel sync succeeded even if video fetch failed
            "channel": channel_info,
            "error": f"Video fetch failed: {e}",
            "videos_synced": 0,
            "videos_updated": 0,
        }

    videos_synced = 0
    videos_updated = 0

    # Batch into groups of 50 (videos.list's hard limit per call) to
    # minimize quota usage instead of one call per video.
    for i in range(0, len(video_ids), 50):
        batch = video_ids[i:i + 50]
        try:
            video_stats = await service.get_video_stats(batch)
        except YouTubeAPIError:
            continue  # skip this batch, keep syncing the rest

        for video in video_stats:
            created = _upsert_content_from_youtube(db, creator_id, video)
            if created:
                videos_synced += 1
            else:
                videos_updated += 1

    return {
        "success": True,
        "channel": channel_info,
        "videos_synced": videos_synced,
        "videos_updated": videos_updated,
    }


def _record_growth_snapshot(db: Session, creator_id: uuid.UUID, follower_count: int) -> None:
    """
    One AudienceGrowth row per creator+platform+day. If today's row
    already exists (re-syncing same day), update it instead of inserting
    a second row for the same date — avoids skewing growth-rate math
    with duplicate same-day data points.
    """
    today = date.today()
    existing = (
        db.query(AudienceGrowth)
        .filter(
            AudienceGrowth.creator_id == creator_id,
            AudienceGrowth.platform == Platform.youtube,
            AudienceGrowth.record_date == today,
        )
        .first()
    )
    if existing:
        existing.follower_count = follower_count
    else:
        db.add(AudienceGrowth(
            creator_id=creator_id,
            platform=Platform.youtube,
            record_date=today,
            follower_count=follower_count,
        ))
    db.commit()


def _upsert_content_from_youtube(db: Session, creator_id: uuid.UUID, video: dict) -> bool:
    """
    Returns True if a new Content row was created, False if an existing
    one was updated. Matches on external_id (the YouTube video ID) --
    the actual key that makes re-syncing idempotent.
    """
    existing = (
        db.query(Content)
        .filter(
            Content.creator_id == creator_id,
            Content.external_id == video["video_id"],
        )
        .first()
    )

    publish_date = datetime.fromisoformat(video["publish_date"].replace("Z", "+00:00"))

    if existing:
        existing.title = video["title"]
        existing.views = video["view_count"]
        existing.likes = video["like_count"]
        existing.comments = video["comment_count"]
        # YouTube's public API doesn't expose reach/impressions/shares/saves
        # for arbitrary channels (that data is only available to the
        # channel owner via YouTube Analytics API, a separate, OAuth-gated
        # API). We use view_count as a reach proxy so engagement rate is
        # still computable, rather than leaving it at 0 and making every
        # synced video show 0% engagement.
        existing.reach = max(existing.reach, video["view_count"])
        db.commit()
        return False

    content = Content(
        creator_id=creator_id,
        platform=Platform.youtube,
        content_type=ContentType.video,
        title=video["title"],
        publish_date=publish_date,
        external_id=video["video_id"],
        reach=video["view_count"],
        impressions=video["view_count"],
        likes=video["like_count"],
        comments=video["comment_count"],
        shares=0,
        saves=0,
        views=video["view_count"],
    )
    db.add(content)
    db.commit()
    return True
