from fastapi import APIRouter, Depends
from fastapi.responses import StreamingResponse
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.services.report_service import (
    generate_creator_report,
    get_creator_platform_comparison
)
import os
from app.utils.excel_export import create_excel_report
from app.services.pdf_service import generate_pdf_report
router = APIRouter(
    prefix="/reports",
    tags=["Reports"]
)


@router.get("/creator/{creator_id}")
def get_creator_report(
    creator_id: int,
    db: Session = Depends(get_db)
):
    return generate_creator_report(db, creator_id)
@router.get("/creator/{creator_id}/platform-comparison")
def get_creator_platform_report(
    creator_id: int,
    db: Session = Depends(get_db)
):
    return get_creator_platform_comparison(db, creator_id)
@router.get("/creator/{creator_id}/export/pdf")
def export_creator_report_pdf(
    creator_id: int,
    db: Session = Depends(get_db)
):
    pdf_buffer = generate_pdf_report(db, creator_id)

    return StreamingResponse(
        pdf_buffer,
        media_type="application/pdf",
        headers={
            "Content-Disposition":
                f"attachment; filename=creator_report_{creator_id}.pdf"
        }
    )
@router.get("/export/excel/{creator_id}")
def export_excel_report(
    creator_id: int,
    db: Session = Depends(get_db)
):

    report_data = generate_creator_report(db, creator_id)

    file_path = f"creator_report_{creator_id}.xlsx"

    create_excel_report(report_data, file_path)

    return FileResponse(
        path=file_path,
        filename=f"creator_report_{creator_id}.xlsx",
        media_type=(
            "application/vnd.openxmlformats-officedocument."
            "spreadsheetml.sheet"
        )
    )