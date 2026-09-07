from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.core.auth import get_current_user
from app.models.user import User

from app.services.reporting_service import generate_creator_report
from app.services.pdf_service import generate_pdf_report
from app.services.excel_service import generate_excel_report


router = APIRouter(
    prefix="/reports",
    tags=["Reports"]
)


def verify_creator_access(
    creator_id: int,
    current_user: User
):
    if current_user.id != creator_id:
        raise HTTPException(
            status_code=403,
            detail="You can only access your own reports"
        )


# =========================================================
# STRUCTURED REPORT
# =========================================================

@router.get("/{creator_id}")
def generate_report(
    creator_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    verify_creator_access(
        creator_id,
        current_user
    )

    report = generate_creator_report(
        db,
        creator_id
    )

    return {
        "message": "Creator report generated successfully",
        "data": report
    }


# =========================================================
# PDF REPORT
# =========================================================

@router.get("/{creator_id}/pdf")
def generate_pdf(
    creator_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    verify_creator_access(
        creator_id,
        current_user
    )

    pdf_file = generate_pdf_report(
        db,
        creator_id
    )

    return StreamingResponse(
        pdf_file,
        media_type="application/pdf",
        headers={
            "Content-Disposition": (
                f"attachment; filename=creator_report_{creator_id}.pdf"
            )
        }
    )


# =========================================================
# EXCEL REPORT
# =========================================================

@router.get("/{creator_id}/excel")
def generate_excel(
    creator_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    verify_creator_access(
        creator_id,
        current_user
    )

    excel_file = generate_excel_report(
        db,
        creator_id
    )

    return StreamingResponse(
        excel_file,
        media_type=(
            "application/vnd.openxmlformats-officedocument."
            "spreadsheetml.sheet"
        ),
        headers={
            "Content-Disposition": (
                f"attachment; filename=creator_report_{creator_id}.xlsx"
            )
        }
    )