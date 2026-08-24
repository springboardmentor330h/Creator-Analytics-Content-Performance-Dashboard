"""
social_media.py

Generic social-media sync orchestration layer. This is where the
"already exists? update : create" duplicate-handling logic lives,
kept platform-agnostic so Instagram/TikTok/etc. can reuse it later —
they just need their own *_service.py that returns the same common
content format as youtube_service.py does.
"""

from typing import Any, Dict, List

from sqlalchemy.orm import Session

from app.models.content import Content
from app.services import youtube_service
from app.services.youtube_service import YouTubeAPIError  # re-exported for routers


def upsert_content_record(db: Session, creator_id: int, record: Dict[str, Any]) -> str:
    """
    Looks for an existing Content row matching (platform, external_content_id).
    Updates it if found, creates it otherwise. Returns "updated" or "created".
    """
    existing = (
        db.query(Content)
        .filter(
            Content.platform == record["platform"],
            Content.external_content_id == record["external_content_id"],
            Content.creator_id == creator_id,
        )
        .first()
    )

    if existing:
        for field, value in record.items():
            setattr(existing, field, value)
        db.commit()
        return "updated"

    new_content = Content(creator_id=creator_id, **record)
    db.add(new_content)
    db.commit()
    return "created"


def sync_youtube_channel(db: Session, creator_id: int, channel_id: str, max_results: int = 10) -> Dict[str, Any]:
    """
    Full YouTube sync workflow:
    fetch -> transform -> validate -> upsert into PostgreSQL -> summarize result.
    Raises YouTubeAPIError on any upstream failure — the router turns that
    into a proper HTTP error response.
    """
    transformed_records: List[Dict[str, Any]] = youtube_service.fetch_and_transform_channel_videos(
        channel_id, max_results=max_results
    )

    created = 0
    updated = 0
    for record in transformed_records:
        # Basic validation before writing to the database.
        if not record.get("external_content_id") or not record.get("content_title"):
            continue

        result = upsert_content_record(db, creator_id, record)
        if result == "created":
            created += 1
        else:
            updated += 1

    return {
        "platform": "YouTube",
        "status": "success",
        "records_synced": created + updated,
        "records_created": created,
        "records_updated": updated,
    }