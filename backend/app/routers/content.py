from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from backend.app.db.database import get_db
from backend.app.models.content import Content
from backend.app.schemas.content import ContentCreate, ContentUpdate, ContentResponse

router = APIRouter(
    prefix="/content",
    tags=["Content"]
)

@router.post("", response_model=ContentResponse, status_code=status.HTTP_201_CREATED)
@router.post("/", response_model=ContentResponse, status_code=status.HTTP_201_CREATED)
def create_content(content: ContentCreate, db: Session = Depends(get_db)):
    db_content = Content(
        creator_id=content.creator_id,
        platform=content.platform,
        content_title=content.content_title,
        views=content.views,
        likes=content.likes,
        comments=content.comments,
        shares=content.shares,
        saves=content.saves,
        watch_time=content.watch_time,
        reach=content.reach,
        published_date=content.published_date
    )
    db.add(db_content)
    db.commit()
    db.refresh(db_content)
    return db_content

@router.get("", response_model=List[ContentResponse])
@router.get("/", response_model=List[ContentResponse])
def get_all_content(db: Session = Depends(get_db)):
    contents = db.query(Content).all()
    return contents

@router.get("/{content_id}", response_model=ContentResponse)
def get_content_by_id(content_id: int, db: Session = Depends(get_db)):
    content = db.query(Content).filter(Content.id == content_id).first()
    if not content:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Content not found"
        )
    return content

@router.put("/{content_id}", response_model=ContentResponse)
def update_content(content_id: int, content_update: ContentUpdate, db: Session = Depends(get_db)):
    db_content = db.query(Content).filter(Content.id == content_id).first()
    if not db_content:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Content not found"
        )

    update_data = content_update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_content, key, value)

    db.commit()
    db.refresh(db_content)
    return db_content

@router.delete("/{content_id}")
def delete_content(content_id: int, db: Session = Depends(get_db)):
    db_content = db.query(Content).filter(Content.id == content_id).first()
    if not db_content:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Content not found"
        )

    db.delete(db_content)
    db.commit()
    return {"message": "Content deleted successfully"}
