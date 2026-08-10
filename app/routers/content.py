from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.schemas.content import ContentCreate, ContentUpdate, ContentResponse
from app.services.content_service import (
    create_content,
    get_all_content,
    get_content,
    update_content,
    delete_content,
)

router = APIRouter(
    prefix="/content",
    tags=["Content"],
)


@router.post("/", response_model=ContentResponse)
def create_new_content(
    content: ContentCreate,
    creator_id: int,
    db: Session = Depends(get_db),
):
    return create_content(
        db=db,
        content=content,
        creator_id=creator_id,
    )


@router.get("/", response_model=list[ContentResponse])
def get_all_contents(
    db: Session = Depends(get_db),
):
    return get_all_content(db)


# GET by ID
@router.get("/{content_id}", response_model=ContentResponse)
def get_content_by_id(
    content_id: int,
    db: Session = Depends(get_db),
):
    content = get_content(db, content_id)

    if not content:
        raise HTTPException(
            status_code=404,
            detail="Content not found",
        )

    return content


# Update
@router.put("/{content_id}", response_model=ContentResponse)
def update_existing_content(
    content_id: int,
    content: ContentUpdate,
    db: Session = Depends(get_db),
):
    updated_content = update_content(
        db=db,
        content_id=content_id,
        content=content,
    )

    if not updated_content:
        raise HTTPException(
            status_code=404,
            detail="Content not found",
        )

    return updated_content


# Delete
@router.delete("/{content_id}")
def delete_existing_content(
    content_id: int,
    db: Session = Depends(get_db),
):
    deleted_content = delete_content(
        db=db,
        content_id=content_id,
    )

    if not deleted_content:
        raise HTTPException(
            status_code=404,
            detail="Content not found",
        )

    return {
        "message": "Content deleted successfully",
        "content_id": content_id,
    }
