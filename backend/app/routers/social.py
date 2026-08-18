from datetime import date
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.social_connection import SocialConnection
from app.models.content import Content
from app.schemas.social import ConnectRequest, SyncRequest
from app.services import social_media

router = APIRouter(prefix="/social", tags=["social-media-integration"])


@router.post("/connect")
def connect_platform(payload: ConnectRequest, db: Session = Depends(get_db)):
    if payload.platform not in social_media.get_supported_platforms():
        raise HTTPException(status_code=400, detail=f"Unsupported platform: {payload.platform}")

    connection = SocialConnection(platform=payload.platform, account_name=payload.account_name)
    db.add(connection)
    db.commit()
    db.refresh(connection)

    return {"message": f"{payload.platform} account connected successfully"}


@router.get("/platforms")
def connected_platforms(db: Session = Depends(get_db)):
    connections = db.query(SocialConnection).all()
    platforms = sorted(set(c.platform for c in connections))
    return {"platforms": platforms}


@router.post("/sync")
def sync_platform_data(payload: SyncRequest, db: Session = Depends(get_db)):
    """
    Workflow: select platform -> get mock platform data -> process ->
    store as Content rows in PostgreSQL -> Analytics APIs read from there.
    """
    connection = (
        db.query(SocialConnection)
        .filter(SocialConnection.platform == payload.platform)
        .first()
    )
    if not connection:
        raise HTTPException(status_code=400, detail=f"{payload.platform} is not connected. Call /social/connect first.")

    raw_items = social_media.get_platform_data(payload.platform)
    if not raw_items:
        raise HTTPException(status_code=404, detail=f"No mock data available for {payload.platform}")

    published_date = payload.published_date or date.today()
    saved = []
    for item in raw_items:
        new_content = Content(
            creator_id=payload.creator_id,
            platform=payload.platform,
            content_title=item["content_title"],
            views=item["views"],
            likes=item["likes"],
            comments=item["comments"],
            shares=item["shares"],
            saves=item["saves"],
            watch_time=item["watch_time"],
            reach=item["reach"],
            published_date=published_date,
        )
        db.add(new_content)
        db.commit()
        db.refresh(new_content)
        saved.append(new_content.id)

    return {"message": f"Synced {len(saved)} items from {payload.platform}", "content_ids": saved}