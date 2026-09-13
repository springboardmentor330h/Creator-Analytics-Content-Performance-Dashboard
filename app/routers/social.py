from datetime import date
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.models.content import Content
from app.schemas.social import SocialConnect,YoutubeSyncRequest
from app.services.social_media import connect,platforms,mock_data
from app.services.youtube_service import YouTubeService

router=APIRouter(prefix="/social",tags=["Social Media"])

@router.post("/connect")
def social_connect(data:SocialConnect):
    return connect(data.creator_id,data.platform,data.account_name)

@router.get("/platforms")
def connected_platforms(creator_id:int=1):
    return platforms(creator_id)

@router.post("/sync")
def sync_platform(platform:str,creator_id:int=1,db:Session=Depends(get_db)):
    rows=mock_data(platform)
    if not rows: raise HTTPException(404,f"No mock data configured for {platform}")
    synced=0
    for r in rows:
        existing=db.query(Content).filter(Content.platform==platform,Content.external_content_id==r[1]).first()
        payload=dict(creator_id=creator_id,platform=platform,content_title=r[0],views=r[2],likes=r[3],
                     comments=r[4],shares=r[5],saves=0,watch_time=r[7],reach=r[6],published_date=date.today(),
                     external_content_id=r[1])
        if existing:
            for k,v in payload.items():
                if k!="creator_id": setattr(existing,k,v)
        else:
            db.add(Content(**payload))
        synced+=1
    db.commit()
    return {"platform":platform,"status":"success","records_synced":synced}

@router.post("/youtube/sync")
def youtube_sync(data:YoutubeSyncRequest,db:Session=Depends(get_db)):
    channel_id=data.channel_id
    if not channel_id:
        raise HTTPException(400,"channel_id is required for YouTube synchronization")
    rows=YouTubeService.fetch_channel_videos(channel_id,data.max_results)
    for r in rows:
        existing=db.query(Content).filter(Content.platform=="YouTube",Content.external_content_id==r["external_content_id"]).first()
        payload={**r,"creator_id":data.creator_id}
        if existing:
            for k,v in payload.items(): setattr(existing,k,v)
        else: db.add(Content(**payload))
    db.commit()
    return {"platform":"YouTube","status":"success","records_synced":len(rows)}
