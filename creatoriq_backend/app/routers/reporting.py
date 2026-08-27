from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.schemas.report import ReportResponse
from app.services.export_service import (
    generate_excel_report,
    generate_pdf_report,
)
from app.services.reporting_service import (
    generate_audience_report,
    generate_content_report,
    generate_creator_report,
    generate_growth_report,
    generate_platform_report,
    generate_revenue_report,
)


router = APIRouter(
    prefix="/reports",
    tags=["Reports"],
)


@router.get(
    "/creator/{creator_id}",
    response_model=ReportResponse,
)
def creator_report_api(
    creator_id: int,
    db: Session = Depends(get_db),
):
    return generate_creator_report(
        db,
        creator_id,
    )


@router.get(
    "/revenue/{creator_id}",
)
def revenue_report_api(
    creator_id: int,
    db: Session = Depends(get_db),
):
    return generate_revenue_report(
        db,
        creator_id,
    )


@router.get(
    "/content/{creator_id}",
)
def content_report_api(
    creator_id: int,
    db: Session = Depends(get_db),
):
    return generate_content_report(
        db,
        creator_id,
    )


@router.get(
    "/audience/{creator_id}",
)
def audience_report_api(
    creator_id: int,
    db: Session = Depends(get_db),
):
    return generate_audience_report(
        db,
        creator_id,
    )


@router.get(
    "/growth/{creator_id}",
)
def growth_report_api(
    creator_id: int,
    db: Session = Depends(get_db),
):
    return generate_growth_report(
        db,
        creator_id,
    )


@router.get(
    "/platform/{creator_id}",
)
def platform_report_api(
    creator_id: int,
    db: Session = Depends(get_db),
):
    return generate_platform_report(
        db,
        creator_id,
    )


@router.get(
    "/export/pdf/{creator_id}",
)
def export_pdf_api(
    creator_id: int,
    db: Session = Depends(get_db),
):
    report = generate_creator_report(
        db,
        creator_id,
    )

    pdf_buffer = generate_pdf_report(
        report,
    )

    return StreamingResponse(
        pdf_buffer,
        media_type="application/pdf",
        headers={
            "Content-Disposition": (
                f"attachment; filename=creator_{creator_id}_report.pdf"
            )
        },
    )


@router.get(
    "/export/excel/{creator_id}",
)
def export_excel_api(
    creator_id: int,
    db: Session = Depends(get_db),
):
    report = generate_creator_report(
        db,
        creator_id,
    )

    excel_buffer = generate_excel_report(
        report,
    )

    return StreamingResponse(
        excel_buffer,
        media_type=(
            "application/vnd.openxmlformats-officedocument."
            "spreadsheetml.sheet"
        ),
        headers={
            "Content-Disposition": (
                f"attachment; filename=creator_{creator_id}_report.xlsx"
            )
        },
    )