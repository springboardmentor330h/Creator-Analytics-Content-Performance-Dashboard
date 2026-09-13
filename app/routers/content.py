from typing import List, Optional
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.models.content import Content
from app.schemas.content import (
    ContentCreate,
    ContentUpdate,
    ContentResponse,
)


router = APIRouter(
    prefix="/content",
    tags=["Content"],
)


@router.post(
    "",
    response_model=ContentResponse,
    status_code=status.HTTP_201_CREATED,
)
@router.post(
    "/",
    response_model=ContentResponse,
    status_code=status.HTTP_201_CREATED,
    include_in_schema=False,
)
def create_content(
    data: ContentCreate,
    db: Session = Depends(get_db),
):
    if data.external_content_id:
        existing = (
            db.query(Content)
            .filter(
                Content.platform == data.platform,
                Content.external_content_id
                == data.external_content_id,
            )
            .first()
        )

        if existing:
            raise HTTPException(
                status_code=409,
                detail=(
                    "Content with this platform and "
                    "external_content_id already exists"
                ),
            )

    obj = Content(**data.model_dump())

    db.add(obj)

    try:
        db.commit()
        db.refresh(obj)
    except Exception:
        db.rollback()
        raise

    return obj


@router.get(
    "",
    response_model=List[ContentResponse],
)
@router.get(
    "/",
    response_model=List[ContentResponse],
    include_in_schema=False,
)
def get_content(
    creator_id: Optional[UUID] = Query(None),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    db: Session = Depends(get_db),
):
    query = db.query(Content)

    if creator_id is not None:
        query = query.filter(
            Content.creator_id == creator_id
        )

    return (
        query
        .order_by(Content.created_at.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )


@router.get(
    "/{content_id}",
    response_model=ContentResponse,
)
def get_content_by_id(
    content_id: UUID,
    db: Session = Depends(get_db),
):
    obj = (
        db.query(Content)
        .filter(Content.id == content_id)
        .first()
    )

    if not obj:
        raise HTTPException(
            status_code=404,
            detail="Content not found",
        )

    return obj


@router.put(
    "/{content_id}",
    response_model=ContentResponse,
)
def update_content(
    content_id: UUID,
    data: ContentUpdate,
    db: Session = Depends(get_db),
):
    obj = (
        db.query(Content)
        .filter(Content.id == content_id)
        .first()
    )

    if not obj:
        raise HTTPException(
            status_code=404,
            detail="Content not found",
        )

    update_data = data.model_dump(
        exclude_unset=True
    )

    for key, value in update_data.items():
        setattr(obj, key, value)

    try:
        db.commit()
        db.refresh(obj)
    except Exception:
        db.rollback()
        raise

    return obj


@router.delete("/{content_id}")
def delete_content(
    content_id: UUID,
    db: Session = Depends(get_db),
):
    obj = (
        db.query(Content)
        .filter(Content.id == content_id)
        .first()
    )

    if not obj:
        raise HTTPException(
            status_code=404,
            detail="Content not found",
        )

    db.delete(obj)

    try:
        db.commit()
    except Exception:
        db.rollback()
        raise

    return {
        "message": "Content deleted successfully"
    }