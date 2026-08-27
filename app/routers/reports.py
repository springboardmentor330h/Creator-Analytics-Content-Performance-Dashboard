from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from fastapi.responses import StreamingResponse

from app.db.database import get_db
from app.core.auth import get_current_user

from app.schemas.report import ReportResponse

from app.services.revenue_service import get_creator_by_email
from app.services.reporting_service import generate_creator_report
from app.services.pdf_service import generate_pdf_report
from app.services.excel_service import generate_excel_report


router = APIRouter(
    prefix="/reports",
    tags=["Reports"]
)


@router.get(
    "/creator",
    response_model=ReportResponse
)
def generate_creator_report_api(
    db: Session = Depends(get_db),
    current_user: str = Depends(get_current_user)
):
    user = get_creator_by_email(
        db,
        current_user
    )

    if not user:
        raise HTTPException(
            status_code=404,
            detail="Creator not found"
        )

    return generate_creator_report(
        db=db,
        creator_id=user.id
    )

@router.get(
    "/creator/pdf"
)
def generate_creator_pdf_api(
    db: Session = Depends(get_db),
    current_user: str = Depends(get_current_user)
):
    user = get_creator_by_email(
        db,
        current_user
    )

    if not user:
        raise HTTPException(
            status_code=404,
            detail="Creator not found"
        )

    report_data = generate_creator_report(
        db=db,
        creator_id=user.id
    )

    pdf_file = generate_pdf_report(
        report_data
    )

    return StreamingResponse(
        pdf_file,
        media_type="application/pdf",
        headers={
            "Content-Disposition": (
                "attachment; "
                "filename=creator_report.pdf"
            )
        }
    )
# --------------------------------------------------
# EXCEL CREATOR REPORT
# --------------------------------------------------

@router.get(
    "/creator/excel"
)
def generate_creator_excel_api(
    db: Session = Depends(get_db),
    current_user: str = Depends(get_current_user)
):
    user = get_creator_by_email(
        db,
        current_user
    )

    if not user:
        raise HTTPException(
            status_code=404,
            detail="Creator not found"
        )

    # Generate the same report data
    # used by the JSON and PDF APIs
    report_data = generate_creator_report(
        db=db,
        creator_id=user.id
    )

    # Convert report data into Excel
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
            "Content-Disposition": (
                "attachment; "
                "filename=creator_report.xlsx"
            )
        }
    )