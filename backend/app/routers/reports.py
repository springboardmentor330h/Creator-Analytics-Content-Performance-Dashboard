"""
Report endpoints. Every route uses get_current_user — a creator can
ONLY ever generate their own report, since generate_creator_report()
is always called with current_user, never a user-supplied ID. There is
deliberately no "?creator_id=" query param — omitting it removes the
unauthorized-access class of bug by construction rather than by check.
"""
from fastapi import APIRouter, Depends, HTTPException, status, Response
from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError

from app.db.session import get_db
from app.core.deps import get_current_user
from app.models.user import User
from app.schemas.report import CreatorReport
from app.services import report_service, pdf_report_service, excel_report_service

router = APIRouter(prefix="/api/reports", tags=["Reports"])


@router.get("/creator", response_model=CreatorReport)
def get_creator_report(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Structured JSON report — reuses existing content/audience/revenue/
    platform services; computes nothing new."""
    try:
        return report_service.generate_creator_report(db, current_user)
    except SQLAlchemyError:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="A database error occurred while generating the report.",
        )


@router.get("/creator/pdf")
def get_creator_report_pdf(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    try:
        report = report_service.generate_creator_report(db, current_user)
    except SQLAlchemyError:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="A database error occurred while generating the report.",
        )

    try:
        pdf_bytes = pdf_report_service.generate_pdf_report(report)
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to generate PDF report.",
        )

    filename = f"creatoriq-report-{current_user.id}.pdf"
    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )


@router.get("/creator/excel")
def get_creator_report_excel(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    try:
        report = report_service.generate_creator_report(db, current_user)
    except SQLAlchemyError:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="A database error occurred while generating the report.",
        )

    try:
        excel_bytes = excel_report_service.generate_excel_report(report)
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to generate Excel report.",
        )

    filename = f"creatoriq-report-{current_user.id}.xlsx"
    return Response(
        content=excel_bytes,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )
