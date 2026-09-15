from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.models.content import Content
from app.models.user import User
from app.schemas.content import (
    ContentCreate,
    ContentUpdate,
    ContentResponse
)
from app.routers.auth import get_current_user


router = APIRouter(
    prefix="/content",
    tags=["Content"]
)


# =========================================================
# CREATE CONTENT
# =========================================================
@router.post(
    "/",
    response_model=ContentResponse,
    status_code=status.HTTP_201_CREATED
)
def create_content(
    content_data: ContentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Creator can create content only for their own account
    if content_data.creator_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can create content only for your own creator account"
        )

    new_content = Content(
        creator_id=current_user.id,
        platform=content_data.platform,
        content_title=content_data.content_title,
        views=content_data.views,
        likes=content_data.likes,
        comments=content_data.comments,
        shares=content_data.shares,
        saves=content_data.saves,
        watch_time=content_data.watch_time,
        reach=content_data.reach,
        published_date=content_data.published_date
    )

    db.add(new_content)
    db.commit()
    db.refresh(new_content)

    return new_content


# =========================================================
# GET MY CONTENT
# =========================================================
@router.get(
    "/",
    response_model=list[ContentResponse]
)
def get_all_content(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return (
        db.query(Content)
        .filter(Content.creator_id == current_user.id)
        .all()
    )


# =========================================================
# GET MY CONTENT BY ID
# =========================================================
@router.get(
    "/{id}",
    response_model=ContentResponse
)
def get_content(
    id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    content = (
        db.query(Content)
        .filter(
            Content.id == id,
            Content.creator_id == current_user.id
        )
        .first()
    )

    if not content:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Content not found"
        )

    return content


# =========================================================
# UPDATE MY CONTENT
# =========================================================
@router.put(
    "/{id}",
    response_model=ContentResponse
)
def update_content(
    id: int,
    content_data: ContentUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    content = (
        db.query(Content)
        .filter(
            Content.id == id,
            Content.creator_id == current_user.id
        )
        .first()
    )

    if not content:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Content not found"
        )

    update_data = content_data.model_dump(exclude_unset=True)

    # Prevent changing ownership to another creator
    update_data.pop("creator_id", None)

    for field, value in update_data.items():
        setattr(content, field, value)

    db.commit()
    db.refresh(content)

    return content


# =========================================================
# DELETE MY CONTENT
# =========================================================
@router.delete("/{id}")
def delete_content(
    id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    content = (
        db.query(Content)
        .filter(
            Content.id == id,
            Content.creator_id == current_user.id
        )
        .first()
    )

    if not content:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Content not found"
        )

    db.delete(content)
    db.commit()

    return {
        "message": "Content deleted successfully"
    }