from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional

from backend.app.db.database import get_db
from backend.app.core.deps import get_current_user
from backend.app.models.user import User
from backend.app.models.content import Content
from backend.app.schemas.content import ContentCreate, ContentUpdate, ContentResponse

router = APIRouter(
    prefix="/content",
    tags=["Content"]
)

@router.post("", response_model=ContentResponse, status_code=status.HTTP_201_CREATED)
@router.post("/", response_model=ContentResponse, status_code=status.HTTP_201_CREATED)
def create_content(
    content: ContentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    db_content = Content(
        creator_id=current_user.id,
        platform=content.platform,
        channel_handle=getattr(content, 'channel_handle', None),
        external_content_id=getattr(content, 'external_content_id', None),
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
def get_all_content(
    platform: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    total_user_content = db.query(Content).filter(Content.creator_id == current_user.id).count()
    if total_user_content == 0:
        from backend.app.services.youtube_service import YouTubeService
        from backend.app.services.instagram_service import InstagramService
        from backend.app.services.twitter_service import TwitterService
        from backend.app.services.facebook_service import FacebookService
        from backend.app.services.linkedin_service import LinkedInService

        try:
            YouTubeService.sync_youtube_videos(db, creator_id=current_user.id, channel_id="@mkbhd")
            InstagramService.sync_instagram_media(db, creator_id=current_user.id, instagram_handle="@cristiano")
            TwitterService.sync_twitter_data(db, creator_id=current_user.id, handle="elonmusk")
            FacebookService.sync_facebook_data(db, creator_id=current_user.id, handle="zuck")
            LinkedInService.sync_linkedin_data(db, creator_id=current_user.id, handle="revanth-rol")
        except Exception as e:
            pass

    query = db.query(Content).filter(Content.creator_id == current_user.id)
    if platform and platform != "All":
        p_lower = platform.lower()
        if p_lower in ["x", "twitter", "twitter/x", "x (twitter)"]:
            query = query.filter(Content.platform.in_(["X", "Twitter", "Twitter/X"]))
        else:
            query = query.filter(Content.platform.ilike(platform))
    return query.all()

@router.get("/{content_id}", response_model=ContentResponse)
def get_content_by_id(
    content_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    content = db.query(Content).filter(
        Content.id == content_id,
        Content.creator_id == current_user.id
    ).first()
    if not content:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Content not found"
        )
    return content

@router.put("/{content_id}", response_model=ContentResponse)
def update_content(
    content_id: int,
    content_update: ContentUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    db_content = db.query(Content).filter(
        Content.id == content_id,
        Content.creator_id == current_user.id
    ).first()
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
def delete_content(
    content_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    db_content = db.query(Content).filter(
        Content.id == content_id,
        Content.creator_id == current_user.id
    ).first()
    if not db_content:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Content not found"
        )

    db.delete(db_content)
    db.commit()
    return {"message": "Content deleted successfully"}
