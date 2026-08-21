from datetime import date

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.models.content import Content
from app.services.social_media import (
    connect_platform,
    get_connected_platforms,
    get_platform_data
)


router = APIRouter(
    prefix="/social",
    tags=["Social Media"]
)


class PlatformConnection(BaseModel):
    platform: str
    account_name: str


class SyncRequest(BaseModel):
    platform: str


@router.post("/connect")
def connect_social_platform(
    request: PlatformConnection
):
    result = connect_platform(
        request.platform,
        request.account_name
    )

    return result


@router.get("/platforms")
def connected_platforms():
    return {
        "platforms": get_connected_platforms()
    }


@router.post("/sync")
def synchronize_platform(
    request: SyncRequest,
    db: Session = Depends(get_db)
):
    platform = request.platform

    if platform not in get_connected_platforms():
        raise HTTPException(
            status_code=400,
            detail="Platform is not connected"
        )

    platform_data = get_platform_data(platform)

    if not platform_data:
        raise HTTPException(
            status_code=404,
            detail="No mock data available for this platform"
        )

    records_synced = 0

    for data in platform_data:

        content = Content(
            creator_id=1,
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

        db.add(content)
        records_synced += 1

    db.commit()

    return {
        "platform": platform,
        "status": "success",
        "records_synced": records_synced
    }