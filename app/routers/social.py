from datetime import date

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.models.content import Content

from app.schemas.social import (
    SocialConnectRequest,
    SocialConnectResponse,
    SocialSyncRequest,
    SocialSyncResponse
)

from app.services.social_media import get_platform_data


router = APIRouter(
    prefix="/social",
    tags=["Social Media"]
)


@router.post(
    "/connect",
    response_model=SocialConnectResponse
)
def connect_platform(
    request: SocialConnectRequest
):
    return {
        "message": f"{request.platform} account connected successfully"
    }


@router.get("/platforms")
def get_connected_platforms():
    return {
        "platforms": [
            "YouTube",
            "Instagram",
            "LinkedIn"
        ]
    }


@router.post(
    "/sync",
    response_model=SocialSyncResponse
)
def sync_platform(
    request: SocialSyncRequest,
    db: Session = Depends(get_db)
):
    platform_data = get_platform_data(request.platform)

    if not platform_data:
        raise HTTPException(
            status_code=404,
            detail=f"No mock data available for platform: {request.platform}"
        )

    records_added = 0

    for data in platform_data:
        total_engagement = (
            data["likes"]
            + data["comments"]
            + data["shares"]
            + data["saves"]
        )

        if data["reach"] > 0:
            engagement_rate = (
                total_engagement / data["reach"]
            ) * 100
        else:
            engagement_rate = 0

        content = Content(
            creator_id=1,
            content_title=data["content_title"],
            platform=data["platform"],
            content_type="Social Media",
            views=data["views"],
            likes=data["likes"],
            comments=data["comments"],
            shares=data["shares"],
            saves=data["saves"],
            watch_time=data["watch_time"],
            reach=data["reach"],
            published_date=date.today(),
            engagement_rate=round(engagement_rate, 2)
        )

        db.add(content)
        records_added += 1

    db.commit()

    return {
        "message": f"{request.platform} data synchronized successfully",
        "platform": request.platform,
        "records_added": records_added
    }
