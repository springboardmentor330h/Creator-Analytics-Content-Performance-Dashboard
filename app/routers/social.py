from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.models.content import Content
from app.services.social_service import (
    SUPPORTED_PLATFORMS,
    generate_mock_content,
    get_supported_platforms,
)
from app.services.youtube_service import (
    YouTubeAPIError,
    fetch_channel_videos,
    transform_youtube_video,
)
from app.utils.responses import success_response

router = APIRouter(prefix="/social", tags=["Social Media"])


@router.get("/platforms")
def list_platforms():
    return success_response(data=get_supported_platforms(), message="Supported platforms retrieved")


@router.post("/connect")
def connect_platform(platform: str, creator_id: int):
    """Simulated OAuth handshake. Real integrations (beyond YouTube) require
    per-platform developer approval, so this models the workflow the frontend
    needs without pretending we have live credentials we don't have."""
    if platform not in SUPPORTED_PLATFORMS:
        raise HTTPException(status_code=400, detail=f"Unsupported platform: {platform}")

    return success_response(
        data={"platform": platform, "creator_id": creator_id, "status": "connected"},
        message=f"{platform} connected successfully",
    )


def _save_content_rows(db: Session, rows: list[dict]) -> dict:
    """Inserts rows, skipping any whose (platform, external_content_id) already exists."""
    inserted, skipped = 0, 0

    for row in rows:
        exists = (
            db.query(Content)
            .filter(
                Content.platform == row["platform"],
                Content.external_content_id == row["external_content_id"],
            )
            .first()
        )
        if exists:
            skipped += 1
            continue

        db.add(Content(**row))
        inserted += 1

    db.commit()
    return {"inserted": inserted, "skipped_duplicates": skipped}


@router.post("/youtube/sync")
def sync_youtube(channel_id: str, creator_id: int, db: Session = Depends(get_db)):
    try:
        videos = fetch_channel_videos(channel_id)
    except YouTubeAPIError as e:
        raise HTTPException(status_code=502, detail=str(e))

    rows = [transform_youtube_video(v, creator_id) for v in videos]
    result = _save_content_rows(db, rows)

    return success_response(data=result, message="YouTube sync complete")


@router.post("/{platform}/sync")
def sync_platform(platform: str, creator_id: int, db: Session = Depends(get_db)):
    """Mock sync for platforms without live API access yet (see README)."""
    if platform not in SUPPORTED_PLATFORMS:
        raise HTTPException(status_code=400, detail=f"Unsupported platform: {platform}")

    if platform == "YouTube":
        raise HTTPException(
            status_code=400,
            detail="Use /social/youtube/sync for real data (requires channel_id).",
        )

    rows = generate_mock_content(platform, creator_id)
    result = _save_content_rows(db, rows)

    return success_response(data=result, message=f"{platform} sync complete (mock data)")
