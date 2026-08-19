from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session
from datetime import date

from app.db.database import get_db
from app.models.content import Content
from app.services.social_media import sync_platform_data

router = APIRouter(
    prefix="/social",
    tags=["Social Media"]
)


class PlatformConnection(BaseModel):
    platform: str
    account_name: str


connected_platforms = []


@router.post("/connect")
def connect_platform(data: PlatformConnection):
    connected_platforms.append({
        "platform": data.platform,
        "account_name": data.account_name
    })

    return {
        "message": f"{data.platform} account connected successfully"
    }


@router.get("/platforms")
def get_connected_platforms():
    return {
        "platforms": [
            item["platform"]
            for item in connected_platforms
        ]
    }
@router.post("/sync")
def sync_platform(
    platform: str,
    db: Session = Depends(get_db)
):
    platform_data = sync_platform_data(platform)

    if not platform_data:
        raise HTTPException(
            status_code=404,
            detail="Platform not found"
        )

    synced_records = []

    for item in platform_data:
        content = Content(
            creator_id=1,
            platform=item["platform"],
            content_title=item["content_title"],
            views=item["views"],
            likes=item["likes"],
            comments=item["comments"],
            shares=item["shares"],
            saves=0,
            watch_time=0,
            reach=item["reach"],
            published_date=date.today()
        )

        db.add(content)
        synced_records.append(item["content_title"])

    db.commit()

    return {
        "message": f"{platform} data synchronized successfully",
        "records_synced": len(synced_records),
        "content": synced_records
    }