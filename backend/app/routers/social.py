from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session
from datetime import date

from app.db.database import get_db
from app.models.content import Content
from app.services.social_media import get_platform_mock_data, MOCK_PLATFORM_DATA

router = APIRouter()

# Simulated in-memory list of connected platforms (resets when server restarts)
connected_platforms: list[str] = []


class ConnectRequest(BaseModel):
    platform: str
    account_name: str


class SyncRequest(BaseModel):
    platform: str
    creator_id: int


@router.post("/social/connect")
def connect_platform(request: ConnectRequest):
    if request.platform not in MOCK_PLATFORM_DATA:
        raise HTTPException(status_code=400, detail=f"Unsupported platform: {request.platform}")

    if request.platform not in connected_platforms:
        connected_platforms.append(request.platform)

    return {"message": f"{request.platform} account connected successfully"}


@router.get("/social/platforms")
def get_connected_platforms():
    return {"platforms": connected_platforms}


@router.post("/social/sync")
def sync_platform_data(request: SyncRequest, db: Session = Depends(get_db)):
    if request.platform not in connected_platforms:
        raise HTTPException(
            status_code=400,
            detail=f"{request.platform} is not connected. Connect it first via /social/connect"
        )

    data = get_platform_mock_data(request.platform)
    if not data:
        raise HTTPException(status_code=400, detail=f"No mock data available for platform: {request.platform}")

    new_content = Content(
        creator_id=request.creator_id,
        platform=data["platform"],
        content_title=data["content_title"],
        views=data["views"],
        likes=data["likes"],
        comments=data["comments"],
        shares=data["shares"],
        saves=data["saves"],
        watch_time=data["watch_time"],
        reach=data["reach"],
        published_date=date.today()
    )
    db.add(new_content)
    db.commit()
    db.refresh(new_content)

    return {
        "message": f"{request.platform} data synchronized successfully",
        "data": {
            "id": new_content.id,
            "creator_id": new_content.creator_id,
            "platform": new_content.platform,
            "content_title": new_content.content_title,
            "views": new_content.views,
            "likes": new_content.likes,
            "comments": new_content.comments,
            "shares": new_content.shares,
            "saves": new_content.saves,
            "watch_time": new_content.watch_time,
            "reach": new_content.reach,
            "published_date": new_content.published_date
        }
    }