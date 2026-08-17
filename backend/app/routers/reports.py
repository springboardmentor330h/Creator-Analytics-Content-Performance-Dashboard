from fastapi import APIRouter, Depends
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from app.database import get_db
from app.services import report_service as svc

router = APIRouter(prefix="/reports", tags=["reports-export"])


@router.get("/content/pdf/{creator_id}")
def content_pdf(creator_id: int, db: Session = Depends(get_db)):
    buffer = svc.generate_content_pdf(db, creator_id)
    return StreamingResponse(
        buffer, media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename=content_report_{creator_id}.pdf"},
    )


@router.get("/content/excel/{creator_id}")
def content_excel(creator_id: int, db: Session = Depends(get_db)):
    buffer = svc.generate_content_excel(db, creator_id)
    return StreamingResponse(
        buffer, media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={"Content-Disposition": f"attachment; filename=content_report_{creator_id}.xlsx"},
    )


@router.get("/audience/excel/{creator_id}")
def audience_excel(creator_id: int, db: Session = Depends(get_db)):
    buffer = svc.generate_audience_excel(db, creator_id)
    return StreamingResponse(
        buffer, media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={"Content-Disposition": f"attachment; filename=audience_report_{creator_id}.xlsx"},
    )


@router.get("/revenue/excel/{creator_id}")
def revenue_excel(creator_id: int, db: Session = Depends(get_db)):
    buffer = svc.generate_revenue_excel(db, creator_id)
    return StreamingResponse(
        buffer, media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={"Content-Disposition": f"attachment; filename=revenue_report_{creator_id}.xlsx"},
    )