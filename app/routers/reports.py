from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session

from app.core.security import get_current_user
from app.db.database import get_db
from app.models.creator import Creator
from app.models.user import User
from app.services.reporting_service import (
    build_report,
    excel_report,
    pdf_report,
)

router = APIRouter(prefix="/reports", tags=["Reports"])


def get_current_creator(
    current_user: User,
    db: Session,
) -> Creator:
    creator = (
        db.query(Creator)
        .filter(Creator.user_id == current_user.id)
        .first()
    )

    if not creator:
        raise HTTPException(
            status_code=404,
            detail="Creator profile not found for this user",
        )

    return creator


@router.get("/summary")
def report_summary(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    creator = get_current_creator(current_user, db)

    return {
        "creator_id": str(creator.id),
        "report": build_report(
            db,
            creator_id=creator.id,
        ),
    }


@router.get("/pdf")
def report_pdf(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    creator = get_current_creator(current_user, db)

    data = {
        "creator_id": str(creator.id),
        "report": build_report(
            db,
            creator_id=creator.id,
        ),
    }

    return StreamingResponse(
        pdf_report(data),
        media_type="application/pdf",
        headers={
            "Content-Disposition": (
                "attachment; filename=creatoriq_report.pdf"
            )
        },
    )


@router.get("/excel")
def report_excel(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    creator = get_current_creator(current_user, db)

    data = {
        "creator_id": str(creator.id),
        "report": build_report(
            db,
            creator_id=creator.id,
        ),
    }

    return StreamingResponse(
        excel_report(data),
        media_type=(
            "application/vnd.openxmlformats-officedocument."
            "spreadsheetml.sheet"
        ),
        headers={
            "Content-Disposition": (
                "attachment; filename=creatoriq_report.xlsx"
            )
        },
    )