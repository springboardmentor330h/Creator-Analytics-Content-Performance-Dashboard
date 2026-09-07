from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.models.content import Content
from app.schemas.content import ContentCreate, ContentResponse, ContentUpdate
from app.utils.responses import success_response


router = APIRouter(prefix="/content", tags=["Content"])


@router.post("/", response_model=dict, status_code=201)
def create_content(
    content_data: ContentCreate,
    db: Session = Depends(get_db)
):
    new_content = Content(
        creator_id=content_data.creator_id,
        platform=content_data.platform,
        content_title=content_data.content_title,
        views=content_data.views,
        likes=content_data.likes,
        comments=content_data.comments,
        shares=content_data.shares,
        saves=content_data.saves,
        watch_time=content_data.watch_time,
        reach=content_data.reach,
        published_date=content_data.published_date,
    )

    db.add(new_content)
    db.commit()
    db.refresh(new_content)

    return success_response(
        data=ContentResponse.model_validate(new_content).model_dump(),
        message="Content created successfully",
        status_code=201
    )


@router.get("/", response_model=dict)
def get_all_content(
    db: Session = Depends(get_db)
):
    contents = db.query(Content).all()

    content_list = [
        ContentResponse.model_validate(content).model_dump()
        for content in contents
    ]

    return success_response(
        data=content_list,
        message="Content retrieved successfully"
    )


@router.get("/{content_id}", response_model=dict)
def get_content_by_id(
    content_id: int,
    db: Session = Depends(get_db)
):
    content = db.query(Content).filter(Content.id == content_id).first()

    if not content:
        raise HTTPException(
            status_code=404,
            detail="Content not found"
        )

    return success_response(
        data=ContentResponse.model_validate(content).model_dump(),
        message="Content retrieved successfully"
    )


@router.put("/{content_id}", response_model=dict)
def update_content(
    content_id: int,
    content_data: ContentUpdate,
    db: Session = Depends(get_db)
):
    content = db.query(Content).filter(Content.id == content_id).first()

    if not content:
        raise HTTPException(
            status_code=404,
            detail="Content not found"
        )

    update_data = content_data.model_dump(exclude_unset=True)

    for field, value in update_data.items():
        setattr(content, field, value)

    db.commit()
    db.refresh(content)

    return success_response(
        data=ContentResponse.model_validate(content).model_dump(),
        message="Content updated successfully"
    )


@router.delete("/{content_id}", response_model=dict)
def delete_content(
    content_id: int,
    db: Session = Depends(get_db)
):
    content = db.query(Content).filter(Content.id == content_id).first()

    if not content:
        raise HTTPException(
            status_code=404,
            detail="Content not found"
        )

    db.delete(content)
    db.commit()

    return success_response(
        data={"id": content_id},
        message="Content deleted successfully"
    )