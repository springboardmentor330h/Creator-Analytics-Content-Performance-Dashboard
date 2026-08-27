"""Reports router — Sprint 7.

Provides structured JSON report summary and downloadable PDF / Excel exports.
All data originates from real PostgreSQL records. Strict creator ownership is
enforced — the creator_id is always taken from the JWT token.
"""
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import Response
from sqlalchemy.orm import Session

from app.core.auth import get_current_user
from app.db.database import get_db
from app.models.user import User
from app.services.reporting_service import (
    generate_excel_report,
    generate_pdf_report,
    get_structured_report,
)

router = APIRouter(prefix="/reports", tags=["Reports"])


@router.get("/summary")
@router.get("/api/reports/summary", include_in_schema=False)
def report_summary(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Return a structured JSON creator report with real analytics data."""
    try:
        report = get_structured_report(db, current_user)
        return report
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate report: {str(exc)}",
        )


@router.get("/export/pdf")
@router.get("/api/reports/export/pdf", include_in_schema=False)
def export_pdf(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Download a professional PDF report built from real PostgreSQL data."""
    try:
        report_data = get_structured_report(db, current_user)
        pdf_bytes = generate_pdf_report(report_data)
        filename = f"creatoriq_report_{current_user.id}.pdf"
        return Response(
            content=pdf_bytes,
            media_type="application/pdf",
            headers={
                "Content-Disposition": f'attachment; filename="{filename}"',
                "Content-Length": str(len(pdf_bytes)),
            },
        )
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"PDF generation failed: {str(exc)}",
        )


@router.get("/export/excel")
@router.get("/api/reports/export/excel", include_in_schema=False)
def export_excel(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Download an Excel workbook with 6 sheets of real PostgreSQL analytics data."""
    try:
        report_data = get_structured_report(db, current_user)
        excel_bytes = generate_excel_report(report_data)
        filename = f"creatoriq_report_{current_user.id}.xlsx"
        return Response(
            content=excel_bytes,
            media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            headers={
                "Content-Disposition": f'attachment; filename="{filename}"',
                "Content-Length": str(len(excel_bytes)),
            },
        )
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Excel generation failed: {str(exc)}",
        )
