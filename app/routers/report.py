from fastapi import APIRouter, Depends
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.services.report_service import get_comprehensive_creator_report
from app.services.export_service import generate_pdf_report, generate_excel_report

router = APIRouter(prefix="/reports", tags=["Reports & Exports"])

@router.get("/export/pdf/{creator_id}")
def export_pdf(creator_id: int, db: Session = Depends(get_db)):
    data = get_comprehensive_creator_report(creator_id, db)
    pdf_buffer = generate_pdf_report(data)
    
    return StreamingResponse(
        pdf_buffer,
        media_type="application/pdf",
        headers={
            "Content-Disposition": f"attachment; filename=creator_{creator_id}_report.pdf"
        }
    )

@router.get("/export/excel/{creator_id}")
def export_excel(creator_id: int, db: Session = Depends(get_db)):
    data = get_comprehensive_creator_report(creator_id, db)
    excel_buffer = generate_excel_report(data)
    
    return StreamingResponse(
        excel_buffer,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={
            "Content-Disposition": f"attachment; filename=creator_{creator_id}_report.xlsx"
        }
    )