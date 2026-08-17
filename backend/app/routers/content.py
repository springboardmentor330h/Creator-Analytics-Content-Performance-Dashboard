from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.content import Content
from app.schemas.content import ContentCreate, ContentUpdate, ContentOut
from app.schemas.content import YouTubeSyncRequest
from app.services import youtube_service

router = APIRouter(prefix="/content", tags=["content"])


@router.post("", response_model=ContentOut, status_code=201)
def create_content(payload: ContentCreate, db: Session = Depends(get_db)):
    new_content = Content(**payload.model_dump())
    db.add(new_content)
    db.commit()
    db.refresh(new_content)
    return new_content


@router.get("", response_model=list[ContentOut])
def get_all_content(db: Session = Depends(get_db)):
    return db.query(Content).all()


@router.get("/{id}", response_model=ContentOut)
def get_content_by_id(id: int, db: Session = Depends(get_db)):
    content = db.query(Content).filter(Content.id == id).first()
    if not content:
        raise HTTPException(status_code=404, detail="Content not found")
    return content


@router.put("/{id}", response_model=ContentOut)
def update_content(id: int, payload: ContentUpdate, db: Session = Depends(get_db)):
    content = db.query(Content).filter(Content.id == id).first()
    if not content:
        raise HTTPException(status_code=404, detail="Content not found")

    update_data = payload.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(content, field, value)

    db.commit()
    db.refresh(content)
    return content


@router.delete("/{id}", status_code=200)
def delete_content(id: int, db: Session = Depends(get_db)):
    content = db.query(Content).filter(Content.id == id).first()
    if not content:
        raise HTTPException(status_code=404, detail="Content not found")

    db.delete(content)
    db.commit()
    return {"message": "Content deleted successfully"}



@router.post("/sync/youtube", response_model=list[ContentOut])
def sync_youtube_content(payload: YouTubeSyncRequest, db: Session = Depends(get_db)):
    if payload.channel_id:
        video_ids = youtube_service.get_channel_video_ids(payload.channel_id, payload.max_results)
    elif payload.search_query:
        video_ids = youtube_service.search_video_ids(payload.search_query, payload.max_results)
    else:
        raise HTTPException(status_code=400, detail="Provide either channel_id or search_query")

    video_data = youtube_service.get_video_details(video_ids)

    saved = []
    for v in video_data:
        new_content = Content(creator_id=payload.creator_id, platform="YouTube", **v)
        db.add(new_content)
        db.commit()
        db.refresh(new_content)
        saved.append(new_content)
    return saved