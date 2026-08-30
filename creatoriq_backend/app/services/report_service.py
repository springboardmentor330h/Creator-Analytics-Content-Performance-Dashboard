from datetime import datetime
from io import BytesIO

from sqlalchemy.orm import Session

from app.models.content import Content

from app.services.analytics_service import (
    calculate_engagement_rate,
    get_kpi_summary,
    get_platform_comparison,
)

from app.services.audience_service import (
    get_audience_report,
    get_growth_report,
)

from app.services import revenue_service


# ============================================================
# BUILD REPORT
# ============================================================

def build_creator_report(
    db: Session,
    creator_id: int | None = None,
    report_type: str = "full",
) -> dict:
    """
    Build a CreatorIQ report.

    creator_id provided:
        Report is scoped to that creator.

    creator_id is None:
        Report contains data from all creators.

    Supported report types:
        full
        content
        audience
        revenue
        growth
        platform
    """

    report_type = (
        report_type
        or "full"
    ).lower().strip()

    allowed_types = {
        "full",
        "content",
        "audience",
        "revenue",
        "growth",
        "platform",
    }

    if report_type not in allowed_types:
        raise ValueError(
            "Invalid report_type. "
            "Use: full, content, audience, "
            "revenue, growth, platform"
        )

    generated_at = (
        datetime.utcnow().isoformat()
        + "Z"
    )

    # ========================================================
    # CONTENT
    # ========================================================

    content_query = db.query(Content)

    if creator_id is not None:
        content_query = content_query.filter(
            Content.creator_id == creator_id
        )

    contents = content_query.all()

    content_performance = []

    for content in contents:

        total_engagement, engagement_rate = (
            calculate_engagement_rate(
                content
            )
        )

        content_performance.append({
            "id": content.id,
            "creator_id": content.creator_id,
            "title": content.content_title,
            "platform": content.platform,
            "views": content.views or 0,
            "likes": content.likes or 0,
            "comments": content.comments or 0,
            "shares": content.shares or 0,
            "saves": content.saves or 0,
            "watch_time": content.watch_time or 0,
            "reach": content.reach or 0,
            "total_engagement": (
                total_engagement
            ),
            "engagement_rate": (
                engagement_rate
            ),
            "published_date": (
                content.published_date.isoformat()
                if content.published_date
                else None
            ),
        })

    content_performance.sort(
        key=lambda item: item[
            "engagement_rate"
        ],
        reverse=True,
    )

    # ========================================================
    # KPI
    # ========================================================

    try:

        kpi = get_kpi_summary(
            db,
            creator_id=creator_id,
        )

    except Exception:

        kpi = {}

    # ========================================================
    # AUDIENCE
    # ========================================================

    try:

        audience = get_audience_report(
            db,
            creator_id=creator_id,
        )

    except Exception:

        audience = {}

    # ========================================================
    # GROWTH
    # ========================================================

    try:

        growth = get_growth_report(
            db,
            creator_id=creator_id,
        )

    except Exception:

        growth = []

    # ========================================================
    # REVENUE
    # ========================================================

    try:

        total_revenue = (
            revenue_service.get_total_revenue(
                db,
                creator_id=creator_id,
            )
        )

    except Exception:

        total_revenue = 0

    try:

        revenue_by_source = (
            revenue_service.get_revenue_by_source(
                db,
                creator_id=creator_id,
            )
        )

    except Exception:

        revenue_by_source = []

    try:

        monthly_revenue = (
            revenue_service.get_monthly_revenue(
                db,
                creator_id=creator_id,
            )
        )

    except Exception:

        monthly_revenue = []

    try:

        revenue_trend = (
            revenue_service.get_revenue_trend(
                db,
                creator_id=creator_id,
            )
        )

    except Exception:

        revenue_trend = {
            "labels": [],
            "values": [],
        }

    # ========================================================
    # PLATFORM COMPARISON
    # ========================================================

    try:

        platform_comparison = (
            get_platform_comparison(
                db,
                creator_id=creator_id,
            )
        )

    except Exception:

        platform_comparison = {}

    # ========================================================
    # SUMMARY
    # ========================================================

    summary = {
        "total_content": len(
            contents
        ),

        "total_views": sum(
            content.views or 0
            for content in contents
        ),

        "total_likes": sum(
            content.likes or 0
            for content in contents
        ),

        "total_comments": sum(
            content.comments or 0
            for content in contents
        ),

        "total_shares": sum(
            content.shares or 0
            for content in contents
        ),

        "total_reach": sum(
            content.reach or 0
            for content in contents
        ),

        "average_engagement_rate": (
            round(
                sum(
                    item[
                        "engagement_rate"
                    ]
                    for item
                    in content_performance
                )
                / len(
                    content_performance
                ),
                2,
            )
            if content_performance
            else 0
        ),

        "total_revenue": (
            total_revenue
        ),

        "kpi_snapshot": kpi,
    }

    # ========================================================
    # REPORT OBJECT
    # ========================================================

    report = {
        "creator_id": creator_id,

        "scope": (
            "all_creators"
            if creator_id is None
            else "creator"
        ),

        "report_type": report_type,

        "generated_at": generated_at,

        "summary": summary,

        "content_performance": [],

        "audience": {},

        "growth": [],

        "revenue": {},

        "platform_comparison": {},
    }

    # ========================================================
    # CONTENT
    # ========================================================

    if report_type in {
        "full",
        "content",
    }:

        report[
            "content_performance"
        ] = content_performance

    # ========================================================
    # AUDIENCE
    # ========================================================

    if report_type in {
        "full",
        "audience",
    }:

        report[
            "audience"
        ] = audience

    # ========================================================
    # GROWTH
    # ========================================================

    if report_type in {
        "full",
        "growth",
    }:

        report[
            "growth"
        ] = (
            growth
            if isinstance(
                growth,
                list,
            )
            else []
        )

    # ========================================================
    # REVENUE
    # ========================================================

    if report_type in {
        "full",
        "revenue",
    }:

        report[
            "revenue"
        ] = {
            "total_revenue": (
                total_revenue
            ),
            "by_source": (
                revenue_by_source
            ),
            "monthly": (
                monthly_revenue
            ),
            "trend": (
                revenue_trend
            ),
        }

    # ========================================================
    # PLATFORM
    # ========================================================

    if report_type in {
        "full",
        "platform",
    }:

        report[
            "platform_comparison"
        ] = platform_comparison

    return report


# ============================================================
# EXCEL HELPERS
# ============================================================

def _append_dict_section(
    worksheet,
    title,
    data,
):

    worksheet.append([
        title
    ])

    if not isinstance(
        data,
        dict,
    ):

        worksheet.append([
            "Value",
            data,
        ])

        worksheet.append([])

        return

    worksheet.append([
        "Metric",
        "Value",
    ])

    for key, value in data.items():

        if isinstance(
            value,
            (dict, list),
        ):
            continue

        worksheet.append([
            key,
            value,
        ])

    worksheet.append([])


def _append_list_section(
    worksheet,
    title,
    rows,
):

    worksheet.append([
        title
    ])

    if not rows:

        worksheet.append([
            "No data available"
        ])

        worksheet.append([])

        return

    if not isinstance(
        rows,
        list,
    ):

        worksheet.append([
            "Value",
            rows,
        ])

        worksheet.append([])

        return

    dictionary_rows = [
        row
        for row in rows
        if isinstance(
            row,
            dict,
        )
    ]

    if not dictionary_rows:

        worksheet.append([
            "Value",
            str(rows),
        ])

        worksheet.append([])

        return

    headers = []

    for row in dictionary_rows:

        for key in row.keys():

            if key not in headers:
                headers.append(key)

    worksheet.append(
        headers
    )

    for row in dictionary_rows:

        worksheet.append([
            row.get(header)
            for header in headers
        ])

    worksheet.append([])


# ============================================================
# EXCEL EXPORT
# ============================================================

def export_report_excel(
    report: dict,
) -> bytes:

    try:

        from openpyxl import Workbook
        from openpyxl.styles import Font
        from openpyxl.utils import get_column_letter

    except ImportError as exc:

        raise RuntimeError(
            "openpyxl is required for Excel export. "
            "Run: pip install openpyxl"
        ) from exc

    workbook = Workbook()

    summary_sheet = workbook.active

    summary_sheet.title = "Summary"

    title = summary_sheet.cell(
        row=1,
        column=1,
        value="CreatorIQ Analytics Report",
    )

    title.font = Font(
        bold=True,
        size=16,
    )

    summary_sheet.append([
        "Scope",
        report.get("scope"),
    ])

    summary_sheet.append([
        "Creator ID",
        report.get("creator_id"),
    ])

    summary_sheet.append([
        "Report Type",
        report.get("report_type"),
    ])

    summary_sheet.append([
        "Generated At",
        report.get("generated_at"),
    ])

    summary_sheet.append([])

    summary_sheet.append([
        "Metric",
        "Value",
    ])

    summary = (
        report.get("summary")
        or {}
    )

    for key, value in summary.items():

        if isinstance(
            value,
            (dict, list),
        ):
            continue

        summary_sheet.append([
            key,
            value,
        ])

    # --------------------------------------------------------
    # CONTENT
    # --------------------------------------------------------

    content_sheet = workbook.create_sheet(
        "Content"
    )

    _append_list_section(
        content_sheet,
        "Content Performance",
        report.get(
            "content_performance"
        ) or [],
    )

    # --------------------------------------------------------
    # AUDIENCE
    # --------------------------------------------------------

    audience_sheet = workbook.create_sheet(
        "Audience"
    )

    _append_dict_section(
        audience_sheet,
        "Audience Analytics",
        report.get(
            "audience"
        ) or {},
    )

    # --------------------------------------------------------
    # GROWTH
    # --------------------------------------------------------

    growth_sheet = workbook.create_sheet(
        "Growth"
    )

    _append_list_section(
        growth_sheet,
        "Growth Trends",
        report.get(
            "growth"
        ) or [],
    )

    # --------------------------------------------------------
    # REVENUE
    # --------------------------------------------------------

    revenue_sheet = workbook.create_sheet(
        "Revenue"
    )

    revenue = (
        report.get("revenue")
        or {}
    )

    revenue_sheet.append([
        "Revenue Summary"
    ])

    revenue_sheet.append([
        "Total Revenue",
        revenue.get(
            "total_revenue",
            0,
        ),
    ])

    revenue_sheet.append([])

    _append_list_section(
        revenue_sheet,
        "Revenue By Source",
        revenue.get(
            "by_source"
        ) or [],
    )

    _append_list_section(
        revenue_sheet,
        "Monthly Revenue",
        revenue.get(
            "monthly"
        ) or [],
    )

    # --------------------------------------------------------
    # PLATFORM
    # --------------------------------------------------------

    platform_sheet = workbook.create_sheet(
        "Platform Comparison"
    )

    platform_data = (
        report.get(
            "platform_comparison"
        )
        or {}
    )

    if isinstance(
        platform_data,
        dict,
    ):

        platform_sheet.append([
            "Platform",
            "Views",
            "Likes",
            "Comments",
            "Reach",
            "Engagement Rate",
        ])

        for platform, data in (
            platform_data.items()
        ):

            if not isinstance(
                data,
                dict,
            ):
                continue

            platform_sheet.append([
                platform,
                data.get(
                    "views",
                    data.get(
                        "total_views",
                        0,
                    ),
                ),
                data.get(
                    "likes",
                    data.get(
                        "total_likes",
                        0,
                    ),
                ),
                data.get(
                    "comments",
                    data.get(
                        "total_comments",
                        0,
                    ),
                ),
                data.get(
                    "reach",
                    data.get(
                        "total_reach",
                        0,
                    ),
                ),
                data.get(
                    "engagement_rate",
                    data.get(
                        "average_engagement_rate",
                        0,
                    ),
                ),
            ])

    # --------------------------------------------------------
    # COLUMN WIDTHS
    # --------------------------------------------------------

    for worksheet in workbook.worksheets:

        for column_cells in worksheet.columns:

            max_length = 0

            column_letter = (
                get_column_letter(
                    column_cells[0].column
                )
            )

            for cell in column_cells:

                value = (
                    str(cell.value)
                    if cell.value is not None
                    else ""
                )

                max_length = max(
                    max_length,
                    len(value),
                )

            worksheet.column_dimensions[
                column_letter
            ].width = min(
                max_length + 2,
                50,
            )

    buffer = BytesIO()

    workbook.save(
        buffer
    )

    return buffer.getvalue()


# ============================================================
# PDF EXPORT
# ============================================================

def _pdf_table(
    canvas,
    x,
    y,
    headers,
    rows,
    column_widths,
    row_height=18,
    font_size=8,
):

    canvas.setFont(
        "Helvetica-Bold",
        font_size,
    )

    current_x = x

    for index, header in enumerate(
        headers
    ):

        canvas.drawString(
            current_x,
            y,
            str(header)[:25],
        )

        current_x += (
            column_widths[index]
        )

    y -= row_height

    canvas.setFont(
        "Helvetica",
        font_size,
    )

    for row in rows:

        current_x = x

        for index, value in enumerate(
            row
        ):

            canvas.drawString(
                current_x,
                y,
                str(value)[:25],
            )

            current_x += (
                column_widths[index]
            )

        y -= row_height

    return y


def export_report_pdf(
    report: dict,
) -> bytes:

    try:

        from reportlab.lib.pagesizes import A4
        from reportlab.pdfgen import canvas

    except ImportError as exc:

        raise RuntimeError(
            "reportlab is required for PDF export. "
            "Run: pip install reportlab"
        ) from exc

    buffer = BytesIO()

    pdf = canvas.Canvas(
        buffer,
        pagesize=A4,
    )

    width, height = A4

    left = 40

    y = height - 45

    def new_page():

        nonlocal y

        pdf.showPage()

        y = height - 45

    def ensure_space(
        required=60
    ):

        nonlocal y

        if y < required:
            new_page()

    def heading(
        text,
        size=14,
    ):

        nonlocal y

        ensure_space(60)

        pdf.setFont(
            "Helvetica-Bold",
            size,
        )

        pdf.drawString(
            left,
            y,
            text,
        )

        y -= 22

    def text(
        value,
        size=9,
    ):

        nonlocal y

        ensure_space(40)

        pdf.setFont(
            "Helvetica",
            size,
        )

        pdf.drawString(
            left,
            y,
            str(value)[:110],
        )

        y -= 14

    # --------------------------------------------------------
    # TITLE
    # --------------------------------------------------------

    pdf.setFont(
        "Helvetica-Bold",
        18,
    )

    pdf.drawString(
        left,
        y,
        "CreatorIQ Analytics Report",
    )

    y -= 28

    text(
        f"Scope: {report.get('scope')}"
    )

    text(
        f"Creator ID: {report.get('creator_id')}"
    )

    text(
        f"Report Type: {report.get('report_type')}"
    )

    text(
        f"Generated At: {report.get('generated_at')}"
    )

    # --------------------------------------------------------
    # SUMMARY
    # --------------------------------------------------------

    heading(
        "1. KPI Summary"
    )

    summary = (
        report.get("summary")
        or {}
    )

    for key, value in summary.items():

        if isinstance(
            value,
            (dict, list),
        ):
            continue

        text(
            f"{key}: {value}"
        )

    # --------------------------------------------------------
    # CONTENT
    # --------------------------------------------------------

    content_rows = (
        report.get(
            "content_performance"
        )
        or []
    )

    if content_rows:

        heading(
            "2. Content Performance"
        )

        headers = [
            "Title",
            "Platform",
            "Views",
            "Reach",
            "Engagement",
            "ER %",
        ]

        rows = []

        for row in content_rows[:20]:

            rows.append([
                str(
                    row.get(
                        "title",
                        "",
                    )
                )[:20],

                row.get(
                    "platform",
                    "",
                ),

                row.get(
                    "views",
                    0,
                ),

                row.get(
                    "reach",
                    0,
                ),

                row.get(
                    "total_engagement",
                    0,
                ),

                row.get(
                    "engagement_rate",
                    0,
                ),
            ])

        ensure_space(100)

        y = _pdf_table(
            pdf,
            left,
            y,
            headers,
            rows,
            [
                125,
                65,
                55,
                55,
                70,
                45,
            ],
        )

        y -= 10

    # --------------------------------------------------------
    # AUDIENCE
    # --------------------------------------------------------

    audience = (
        report.get(
            "audience"
        )
        or {}
    )

    if audience:

        heading(
            "3. Audience Analytics"
        )

        for key, value in audience.items():

            text(
                f"{key}: {value}"
            )

    # --------------------------------------------------------
    # GROWTH
    # --------------------------------------------------------

    growth_rows = (
        report.get(
            "growth"
        )
        or []
    )

    if growth_rows:

        heading(
            "4. Growth Trends"
        )

        headers = [
            "Date",
            "Followers",
            "Daily Growth",
            "Growth %",
        ]

        rows = []

        for row in growth_rows[:30]:

            if isinstance(
                row,
                dict,
            ):

                rows.append([
                    row.get(
                        "date",
                        "",
                    ),

                    row.get(
                        "followers",
                        0,
                    ),

                    row.get(
                        "daily_growth",
                        0,
                    ),

                    row.get(
                        "growth_percentage",
                        row.get(
                            "growth_percent",
                            0,
                        ),
                    ),
                ])

        if rows:

            ensure_space(100)

            y = _pdf_table(
                pdf,
                left,
                y,
                headers,
                rows,
                [
                    100,
                    100,
                    100,
                    100,
                ],
            )

            y -= 10

    # --------------------------------------------------------
    # REVENUE
    # --------------------------------------------------------

    revenue = (
        report.get(
            "revenue"
        )
        or {}
    )

    if revenue:

        heading(
            "5. Revenue Analytics"
        )

        text(
            "Total Revenue: "
            f"{revenue.get('total_revenue', 0)}"
        )

        by_source = (
            revenue.get(
                "by_source"
            )
            or []
        )

        if by_source:

            headers = [
                "Source",
                "Amount",
            ]

            rows = []

            for row in by_source:

                if isinstance(
                    row,
                    dict,
                ):

                    rows.append([
                        row.get(
                            "source",
                            "",
                        ),

                        row.get(
                            "total_amount",
                            0,
                        ),
                    ])

            if rows:

                ensure_space(100)

                y = _pdf_table(
                    pdf,
                    left,
                    y,
                    headers,
                    rows,
                    [
                        180,
                        100,
                    ],
                )

                y -= 10

    # --------------------------------------------------------
    # PLATFORM
    # --------------------------------------------------------

    platform_data = (
        report.get(
            "platform_comparison"
        )
        or {}
    )

    if platform_data:

        heading(
            "6. Platform Comparison"
        )

        if isinstance(
            platform_data,
            dict,
        ):

            headers = [
                "Platform",
                "Views",
                "Likes",
                "Comments",
                "Reach",
                "ER %",
            ]

            rows = []

            for platform, data in (
                platform_data.items()
            ):

                if isinstance(
                    data,
                    dict,
                ):

                    rows.append([
                        platform,

                        data.get(
                            "views",
                            data.get(
                                "total_views",
                                0,
                            ),
                        ),

                        data.get(
                            "likes",
                            data.get(
                                "total_likes",
                                0,
                            ),
                        ),

                        data.get(
                            "comments",
                            data.get(
                                "total_comments",
                                0,
                            ),
                        ),

                        data.get(
                            "reach",
                            data.get(
                                "total_reach",
                                0,
                            ),
                        ),

                        data.get(
                            "engagement_rate",
                            data.get(
                                "average_engagement_rate",
                                0,
                            ),
                        ),
                    ])

            if rows:

                ensure_space(100)

                y = _pdf_table(
                    pdf,
                    left,
                    y,
                    headers,
                    rows,
                    [
                        90,
                        65,
                        60,
                        65,
                        60,
                        55,
                    ],
                )

    pdf.save()

    return buffer.getvalue()