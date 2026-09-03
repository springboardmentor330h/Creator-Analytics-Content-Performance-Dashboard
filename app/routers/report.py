from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.models.user import User, UserRole
from app.core.auth import get_current_user

from app.services.reporting_service import generate_creator_report
from app.services.pdf_service import generate_pdf_report
from app.services.excel_service import generate_excel_report


router = APIRouter(
    prefix="/reports",
    tags=["Reports"]
)


# =====================================================
# PDF REPORT
# =====================================================

@router.get("/{creator_id}/pdf")
def download_creator_report_pdf(
    creator_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role != UserRole.CREATOR:
        raise HTTPException(
            status_code=403,
            detail="Only creators can access reports"
        )

    if current_user.id != creator_id:
        raise HTTPException(
            status_code=403,
            detail="You can access only your own report"
        )

    report_data = generate_creator_report(
        db,
        creator_id
    )

    pdf_file = generate_pdf_report(
        report_data
    )

    return StreamingResponse(
        pdf_file,
        media_type="application/pdf",
        headers={
            "Content-Disposition":
                f"attachment; filename=creator_{creator_id}_report.pdf"
        }
    )


# =====================================================
# EXCEL REPORT
# =====================================================

@router.get("/{creator_id}/excel")
def download_creator_report_excel(
    creator_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role != UserRole.CREATOR:
        raise HTTPException(
            status_code=403,
            detail="Only creators can access reports"
        )

    if current_user.id != creator_id:
        raise HTTPException(
            status_code=403,
            detail="You can access only your own report"
        )

    report_data = generate_creator_report(
        db,
        creator_id
    )

    excel_file = generate_excel_report(
        report_data
    )

    return StreamingResponse(
        excel_file,
        media_type=(
            "application/vnd.openxmlformats-officedocument."
            "spreadsheetml.sheet"
        ),
        headers={
            "Content-Disposition":
                f"attachment; filename=creator_{creator_id}_report.xlsx"
        }
    )


# =====================================================
# JSON CREATOR REPORT
# =====================================================

@router.get("/{creator_id}")
def get_creator_report(
    creator_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role != UserRole.CREATOR:
        raise HTTPException(
            status_code=403,
            detail="Only creators can access reports"
        )

    if current_user.id != creator_id:
        raise HTTPException(
            status_code=403,
            detail="You can access only your own report"
        )

    return generate_creator_report(
        db,
        creator_id
    )