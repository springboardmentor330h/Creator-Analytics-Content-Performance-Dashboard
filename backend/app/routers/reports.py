from fastapi import APIRouter, Depends, HTTPException, status, Query, Response
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from typing import List, Dict, Any, Optional
import json

from backend.app.db.database import get_db
from backend.app.models.user import User
from backend.app.core.deps import get_current_user
from backend.app.services.report_service import ReportService
from backend.app.services.export_service import ExportService
from backend.app.schemas.report import (
    ReportTypeInfo,
    ReportGenerateRequest,
    ReportResponse
)

router = APIRouter(
    prefix="/reports",
    tags=["Reporting & Export Engine"]
)


@router.get("/types", response_model=List[ReportTypeInfo])
@router.get("/types/", response_model=List[ReportTypeInfo])
def get_report_types():
    """List all supported analytics report types."""
    return ReportService.get_available_report_types()


@router.post("/generate")
@router.post("/generate/")
def generate_report(
    req: ReportGenerateRequest,
    save: bool = Query(True, description="Save report record to creator history"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Generate a live, structured analytics report JSON for the current creator.
    """
    if save:
        report = ReportService.create_and_save_report(
            db=db,
            creator_id=current_user.id,
            report_type=req.report_type,
            date_range=req.date_range
        )
        data = json.loads(report.summary_json)
        data["id"] = report.id
        return data
    else:
        return ReportService.generate_report_data(
            db=db,
            creator_id=current_user.id,
            report_type=req.report_type,
            date_range=req.date_range
        )


@router.get("", response_model=List[ReportResponse])
@router.get("/", response_model=List[ReportResponse])
def get_saved_reports(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """List all saved analytics reports for the authenticated creator."""
    reports = ReportService.get_creator_reports(db, current_user.id)
    results = []
    for r in reports:
        summary_data = json.loads(r.summary_json) if r.summary_json else {}
        results.append(ReportResponse(
            id=r.id,
            creator_id=r.creator_id,
            title=r.title,
            report_type=r.report_type,
            date_range=r.date_range,
            summary_data=summary_data,
            created_at=r.created_at
        ))
    return results


@router.get("/{report_id}")
def get_report_by_id(
    report_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get details of a saved report by ID."""
    report = ReportService.get_report_by_id(db, current_user.id, report_id)
    if not report:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Report record not found"
        )
    data = json.loads(report.summary_json)
    data["id"] = report.id
    return data


@router.post("/export/pdf")
@router.post("/export/pdf/")
def export_pdf_report(
    req: ReportGenerateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Generate and download a styled PDF report binary file.
    """
    report_data = ReportService.generate_report_data(
        db=db,
        creator_id=current_user.id,
        report_type=req.report_type,
        date_range=req.date_range
    )
    pdf_bytes = ExportService.generate_pdf_report(report_data)
    
    filename = f"CreatorIQ_Report_{req.report_type}_{current_user.id}.pdf"
    
    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={
            "Content-Disposition": f"attachment; filename={filename}"
        }
    )


@router.post("/export/excel")
@router.post("/export/excel/")
def export_excel_report(
    req: ReportGenerateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Generate and download a formatted multi-sheet Excel spreadsheet (.xlsx).
    """
    report_data = ReportService.generate_report_data(
        db=db,
        creator_id=current_user.id,
        report_type=req.report_type,
        date_range=req.date_range
    )
    excel_bytes = ExportService.generate_excel_report(report_data)
    
    filename = f"CreatorIQ_Report_{req.report_type}_{current_user.id}.xlsx"
    
    return Response(
        content=excel_bytes,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={
            "Content-Disposition": f"attachment; filename={filename}"
        }
    )


@router.get("/{report_id}/pdf")
def export_saved_report_pdf(
    report_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Download PDF for an existing saved report ID."""
    report = ReportService.get_report_by_id(db, current_user.id, report_id)
    if not report:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Report record not found"
        )
    report_data = json.loads(report.summary_json)
    pdf_bytes = ExportService.generate_pdf_report(report_data)
    
    filename = f"CreatorIQ_Report_{report.id}.pdf"
    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )


@router.get("/{report_id}/excel")
def export_saved_report_excel(
    report_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Download Excel for an existing saved report ID."""
    report = ReportService.get_report_by_id(db, current_user.id, report_id)
    if not report:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Report record not found"
        )
    report_data = json.loads(report.summary_json)
    excel_bytes = ExportService.generate_excel_report(report_data)
    
    filename = f"CreatorIQ_Report_{report.id}.xlsx"
    return Response(
        content=excel_bytes,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )


@router.delete("/{report_id}", status_code=status.HTTP_200_OK)
def delete_report(
    report_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Delete a saved report record."""
    success = ReportService.delete_report(db, current_user.id, report_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Report record not found"
        )
    return {"message": "Report record deleted successfully"}
