from io import BytesIO
from typing import Any

from openpyxl import Workbook
from openpyxl.styles import (
    Alignment,
    Border,
    Font,
    PatternFill,
    Side,
)
from openpyxl.utils import get_column_letter

from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import (
    ParagraphStyle,
    getSampleStyleSheet,
)
from reportlab.platypus import (
    Paragraph,
    SimpleDocTemplate,
    Spacer,
    Table,
    TableStyle,
)


def money(value: Any) -> str:
    try:
        return f"₹{float(value):,.2f}"
    except (TypeError, ValueError):
        return str(value)


def pretty_label(value: Any) -> str:
    return str(value).replace(
        "_",
        " ",
    ).title()


def add_pdf_table(
    story,
    headers,
    rows,
    heading_style,
    normal_style,
):
    if not rows:
        story.append(
            Paragraph(
                "No data available.",
                normal_style,
            )
        )
        story.append(
            Spacer(1, 8)
        )
        return

    story.append(
        Table(
            [headers] + rows,
            repeatRows=1,
            hAlign="LEFT",
            style=TableStyle(
                [
                    (
                        "BACKGROUND",
                        (0, 0),
                        (-1, 0),
                        colors.HexColor(
                            "#1F4E78"
                        ),
                    ),
                    (
                        "TEXTCOLOR",
                        (0, 0),
                        (-1, 0),
                        colors.white,
                    ),
                    (
                        "FONTNAME",
                        (0, 0),
                        (-1, 0),
                        "Helvetica-Bold",
                    ),
                    (
                        "FONTSIZE",
                        (0, 0),
                        (-1, -1),
                        8,
                    ),
                    (
                        "GRID",
                        (0, 0),
                        (-1, -1),
                        0.5,
                        colors.grey,
                    ),
                    (
                        "ROWBACKGROUNDS",
                        (0, 1),
                        (-1, -1),
                        [
                            colors.white,
                            colors.HexColor(
                                "#F3F6F9"
                            ),
                        ],
                    ),
                    (
                        "VALIGN",
                        (0, 0),
                        (-1, -1),
                        "MIDDLE",
                    ),
                    (
                        "LEFTPADDING",
                        (0, 0),
                        (-1, -1),
                        6,
                    ),
                    (
                        "RIGHTPADDING",
                        (0, 0),
                        (-1, -1),
                        6,
                    ),
                    (
                        "TOPPADDING",
                        (0, 0),
                        (-1, -1),
                        5,
                    ),
                    (
                        "BOTTOMPADDING",
                        (0, 0),
                        (-1, -1),
                        5,
                    ),
                ]
            ),
        )
    )

    story.append(
        Spacer(1, 12)
    )


def generate_pdf_report(
    report_data: dict,
):
    buffer = BytesIO()

    document = SimpleDocTemplate(
        buffer,
        pagesize=A4,
        rightMargin=36,
        leftMargin=36,
        topMargin=36,
        bottomMargin=36,
        title="CreatorIQ Analytics Report",
    )

    styles = getSampleStyleSheet()

    title_style = ParagraphStyle(
        "CreatorIQTitle",
        parent=styles["Title"],
        fontSize=20,
        leading=24,
        alignment=TA_CENTER,
        spaceAfter=10,
    )

    subtitle_style = ParagraphStyle(
        "CreatorIQSubtitle",
        parent=styles["Normal"],
        fontSize=10,
        leading=14,
        alignment=TA_CENTER,
        spaceAfter=18,
    )

    heading_style = ParagraphStyle(
        "CreatorIQHeading",
        parent=styles["Heading2"],
        fontSize=14,
        leading=18,
        spaceBefore=12,
        spaceAfter=8,
    )

    normal_style = ParagraphStyle(
        "CreatorIQNormal",
        parent=styles["Normal"],
        fontSize=8.5,
        leading=11,
    )

    story = []

    creator_id = report_data.get(
        "creator_id",
        "N/A",
    )

    story.append(
        Paragraph(
            "CreatorIQ Analytics Report",
            title_style,
        )
    )

    story.append(
        Paragraph(
            f"Creator ID: {creator_id}",
            subtitle_style,
        )
    )

    # ========================================================
    # CONTENT
    # ========================================================

    content = report_data.get(
        "content_performance",
        {},
    )

    story.append(
        Paragraph(
            "Content Performance",
            heading_style,
        )
    )

    content_summary = content.get(
        "summary",
        {},
    )

    add_pdf_table(
        story,
        ["Metric", "Value"],
        [
            [
                "Total Content",
                content_summary.get(
                    "total_content",
                    0,
                ),
            ],
            [
                "Total Views",
                content_summary.get(
                    "total_views",
                    0,
                ),
            ],
            [
                "Total Reach",
                content_summary.get(
                    "total_reach",
                    0,
                ),
            ],
            [
                "Average Engagement Rate",
                f"{content_summary.get(
                    'average_engagement_rate',
                    0,
                ):.2f}%",
            ],
            [
                "Best Platform",
                content_summary.get(
                    "best_platform",
                    "N/A",
                ),
            ],
            [
                "Top Content",
                content_summary.get(
                    "top_content",
                    "N/A",
                ),
            ],
        ],
        heading_style,
        normal_style,
    )

    top_content = content.get(
        "top_content",
        [],
    )

    if top_content:
        add_pdf_table(
            story,
            [
                "Content",
                "Platform",
                "Views",
                "Reach",
                "Engagement",
            ],
            [
                [
                    item.get(
                        "content_title",
                        "N/A",
                    ),
                    item.get(
                        "platform",
                        "N/A",
                    ),
                    item.get(
                        "views",
                        0,
                    ),
                    item.get(
                        "reach",
                        0,
                    ),
                    f"{item.get(
                        'engagement_rate',
                        0,
                    ):.2f}%",
                ]
                for item in top_content
            ],
            heading_style,
            normal_style,
        )

    # ========================================================
    # AUDIENCE
    # ========================================================

    audience = report_data.get(
        "audience_analytics",
        {},
    )

    story.append(
        Paragraph(
            "Audience Analytics",
            heading_style,
        )
    )

    audience_summary = audience.get(
        "summary",
        {},
    )

    add_pdf_table(
        story,
        ["Metric", "Value"],
        [
            [
                "Total Followers",
                audience_summary.get(
                    "total_followers",
                    0,
                ),
            ],
            [
                "Total Reach",
                audience_summary.get(
                    "total_reach",
                    0,
                ),
            ],
            [
                "Total Impressions",
                audience_summary.get(
                    "total_impressions",
                    0,
                ),
            ],
        ],
        heading_style,
        normal_style,
    )

    gender = audience.get(
        "gender_distribution",
        {},
    )

    if gender:
        add_pdf_table(
            story,
            ["Gender", "Percentage"],
            [
                [
                    key,
                    f"{value:.2f}%",
                ]
                for key, value in gender.items()
            ],
            heading_style,
            normal_style,
        )

    age = audience.get(
        "age_distribution",
        {},
    )

    if age:
        add_pdf_table(
            story,
            ["Age Group", "Percentage"],
            [
                [
                    key,
                    f"{value:.2f}%",
                ]
                for key, value in age.items()
            ],
            heading_style,
            normal_style,
        )

    countries = audience.get(
        "top_countries",
        [],
    )

    if countries:
        add_pdf_table(
            story,
            ["Country", "Audience Count"],
            [
                [
                    item.get(
                        "country",
                        "N/A",
                    ),
                    item.get(
                        "count",
                        0,
                    ),
                ]
                for item in countries
            ],
            heading_style,
            normal_style,
        )

    # ========================================================
    # REVENUE
    # ========================================================

    revenue = report_data.get(
        "revenue",
        {},
    )

    story.append(
        Paragraph(
            "Revenue Analytics",
            heading_style,
        )
    )

    revenue_summary = revenue.get(
        "revenue_summary",
        {},
    )

    add_pdf_table(
        story,
        ["Metric", "Value"],
        [
            [
                "Creator ID",
                revenue_summary.get(
                    "creator_id",
                    creator_id,
                ),
            ],
            [
                "Total Revenue",
                money(
                    revenue_summary.get(
                        "total_revenue",
                        0,
                    )
                ),
            ],
        ],
        heading_style,
        normal_style,
    )

    source_rows = revenue.get(
        "revenue_by_source",
        {},
    ).get(
        "revenue_by_source",
        [],
    )

    if source_rows:
        add_pdf_table(
            story,
            [
                "Revenue Source",
                "Amount",
            ],
            [
                [
                    item.get(
                        "source",
                        "Unknown",
                    ),
                    money(
                        item.get(
                            "amount",
                            0,
                        )
                    ),
                ]
                for item in source_rows
            ],
            heading_style,
            normal_style,
        )

    monthly_rows = revenue.get(
        "monthly_revenue",
        {},
    ).get(
        "monthly_revenue",
        [],
    )

    if monthly_rows:
        add_pdf_table(
            story,
            [
                "Month",
                "Revenue",
            ],
            [
                [
                    item.get(
                        "month",
                        "Unknown",
                    ),
                    money(
                        item.get(
                            "amount",
                            0,
                        )
                    ),
                ]
                for item in monthly_rows
            ],
            heading_style,
            normal_style,
        )

    # ========================================================
    # GROWTH
    # ========================================================

    growth = report_data.get(
        "growth_trends",
        {},
    )

    growth_rows = growth.get(
        "growth_trend",
        [],
    )

    story.append(
        Paragraph(
            "Growth Trends",
            heading_style,
        )
    )

    if growth_rows:
        add_pdf_table(
            story,
            [
                "Date",
                "Followers",
                "Daily Growth",
                "Growth %",
                "Reach",
                "Engagement",
            ],
            [
                [
                    item.get(
                        "date",
                        "N/A",
                    ),
                    item.get(
                        "followers",
                        0,
                    ),
                    item.get(
                        "daily_growth",
                        0,
                    ),
                    f"{item.get(
                        'growth_percentage',
                        0,
                    ):.2f}%",
                    item.get(
                        "reach",
                        0,
                    ),
                    f"{item.get(
                        'engagement_rate',
                        0,
                    ):.2f}%",
                ]
                for item in growth_rows
            ],
            heading_style,
            normal_style,
        )
    else:
        story.append(
            Paragraph(
                "No growth data available.",
                normal_style,
            )
        )

    # ========================================================
    # PLATFORM
    # ========================================================

    platform = report_data.get(
        "platform_comparison",
        {},
    )

    platform_rows = platform.get(
        "platform_comparison",
        {},
    )

    story.append(
        Paragraph(
            "Platform Comparison",
            heading_style,
        )
    )

    if platform_rows:
        add_pdf_table(
            story,
            [
                "Platform",
                "Views",
                "Reach",
                "Likes",
                "Comments",
                "Engagement",
            ],
            [
                [
                    platform_name,
                    values.get(
                        "views",
                        0,
                    ),
                    values.get(
                        "reach",
                        0,
                    ),
                    values.get(
                        "likes",
                        0,
                    ),
                    values.get(
                        "comments",
                        0,
                    ),
                    f"{values.get(
                        'engagement_rate',
                        0,
                    ):.2f}%",
                ]
                for platform_name, values
                in platform_rows.items()
            ],
            heading_style,
            normal_style,
        )
    else:
        story.append(
            Paragraph(
                "No platform data available.",
                normal_style,
            )
        )

    document.build(story)

    buffer.seek(0)

    return buffer


def generate_excel_report(
    report_data: dict,
):
    workbook = Workbook()

    worksheet = workbook.active

    if worksheet is None:
        raise RuntimeError(
            "Unable to access Excel worksheet."
        )

    worksheet.title = "Creator Report"

    title_font = Font(
        bold=True,
        size=18,
    )

    section_font = Font(
        bold=True,
        size=13,
    )

    header_font = Font(
        bold=True,
        color="FFFFFF",
    )

    header_fill = PatternFill(
        fill_type="solid",
        fgColor="1F4E78",
    )

    section_fill = PatternFill(
        fill_type="solid",
        fgColor="D9EAF7",
    )

    thin_border = Border(
        left=Side(
            style="thin",
            color="B7B7B7",
        ),
        right=Side(
            style="thin",
            color="B7B7B7",
        ),
        top=Side(
            style="thin",
            color="B7B7B7",
        ),
        bottom=Side(
            style="thin",
            color="B7B7B7",
        ),
    )

    row = 1

    def add_title(title):
        nonlocal row

        cell = worksheet.cell(
            row=row,
            column=1,
            value=title,
        )

        cell.font = title_font

        row += 1

    def add_section(title):
        nonlocal row

        cell = worksheet.cell(
            row=row,
            column=1,
            value=title,
        )

        cell.font = section_font
        cell.fill = section_fill

        row += 1

    def add_table(
        headers,
        rows,
    ):
        nonlocal row

        if not rows:
            return

        for column_index, header in enumerate(
            headers,
            start=1,
        ):
            cell = worksheet.cell(
                row=row,
                column=column_index,
                value=header,
            )

            cell.font = header_font
            cell.fill = header_fill
            cell.border = thin_border
            cell.alignment = Alignment(
                horizontal="center"
            )

        row += 1

        for data_row in rows:
            for column_index, value in enumerate(
                data_row,
                start=1,
            ):
                cell = worksheet.cell(
                    row=row,
                    column=column_index,
                    value=value,
                )

                cell.border = thin_border

                if isinstance(
                    value,
                    (int, float),
                ):
                    cell.number_format = (
                        "#,##0.00"
                    )

            row += 1

        row += 1

    # ========================================================
    # TITLE
    # ========================================================

    add_title(
        "CreatorIQ Analytics Report"
    )

    worksheet.cell(
        row=row,
        column=1,
        value="Creator ID",
    )

    worksheet.cell(
        row=row,
        column=2,
        value=report_data.get(
            "creator_id",
            "N/A",
        ),
    )

    row += 2

    # ========================================================
    # CONTENT
    # ========================================================

    content = report_data.get(
        "content_performance",
        {},
    )

    add_section(
        "Content Performance"
    )

    content_summary = content.get(
        "summary",
        {},
    )

    add_table(
        [
            "Metric",
            "Value",
        ],
        [
            [
                "Total Content",
                content_summary.get(
                    "total_content",
                    0,
                ),
            ],
            [
                "Total Views",
                content_summary.get(
                    "total_views",
                    0,
                ),
            ],
            [
                "Total Reach",
                content_summary.get(
                    "total_reach",
                    0,
                ),
            ],
            [
                "Average Engagement Rate",
                content_summary.get(
                    "average_engagement_rate",
                    0,
                ),
            ],
            [
                "Best Platform",
                content_summary.get(
                    "best_platform",
                    "N/A",
                ),
            ],
        ],
    )

    top_content = content.get(
        "top_content",
        [],
    )

    if top_content:
        add_table(
            [
                "Content",
                "Platform",
                "Views",
                "Reach",
                "Engagement",
            ],
            [
                [
                    item.get(
                        "content_title",
                        "N/A",
                    ),
                    item.get(
                        "platform",
                        "N/A",
                    ),
                    item.get(
                        "views",
                        0,
                    ),
                    item.get(
                        "reach",
                        0,
                    ),
                    item.get(
                        "engagement_rate",
                        0,
                    ),
                ]
                for item in top_content
            ],
        )

    # ========================================================
    # AUDIENCE
    # ========================================================

    audience = report_data.get(
        "audience_analytics",
        {},
    )

    add_section(
        "Audience Analytics"
    )

    audience_summary = audience.get(
        "summary",
        {},
    )

    add_table(
        [
            "Metric",
            "Value",
        ],
        [
            [
                "Total Followers",
                audience_summary.get(
                    "total_followers",
                    0,
                ),
            ],
            [
                "Total Reach",
                audience_summary.get(
                    "total_reach",
                    0,
                ),
            ],
            [
                "Total Impressions",
                audience_summary.get(
                    "total_impressions",
                    0,
                ),
            ],
        ],
    )

    gender = audience.get(
        "gender_distribution",
        {},
    )

    if gender:
        add_table(
            [
                "Gender",
                "Percentage",
            ],
            [
                [
                    key,
                    value,
                ]
                for key, value
                in gender.items()
            ],
        )

    age = audience.get(
        "age_distribution",
        {},
    )

    if age:
        add_table(
            [
                "Age Group",
                "Percentage",
            ],
            [
                [
                    key,
                    value,
                ]
                for key, value
                in age.items()
            ],
        )

    # ========================================================
    # REVENUE
    # ========================================================

    revenue = report_data.get(
        "revenue",
        {},
    )

    add_section(
        "Revenue Analytics"
    )

    revenue_summary = revenue.get(
        "revenue_summary",
        {},
    )

    add_table(
        [
            "Metric",
            "Value",
        ],
        [
            [
                "Creator ID",
                revenue_summary.get(
                    "creator_id",
                    report_data.get(
                        "creator_id"
                    ),
                ),
            ],
            [
                "Total Revenue",
                revenue_summary.get(
                    "total_revenue",
                    0,
                ),
            ],
        ],
    )

    source_rows = revenue.get(
        "revenue_by_source",
        {},
    ).get(
        "revenue_by_source",
        [],
    )

    if source_rows:
        add_table(
            [
                "Revenue Source",
                "Amount",
            ],
            [
                [
                    item.get(
                        "source",
                        "Unknown",
                    ),
                    item.get(
                        "amount",
                        0,
                    ),
                ]
                for item in source_rows
            ],
        )

    monthly_rows = revenue.get(
        "monthly_revenue",
        {},
    ).get(
        "monthly_revenue",
        [],
    )

    if monthly_rows:
        add_table(
            [
                "Month",
                "Revenue",
            ],
            [
                [
                    item.get(
                        "month",
                        "Unknown",
                    ),
                    item.get(
                        "amount",
                        0,
                    ),
                ]
                for item in monthly_rows
            ],
        )

    # ========================================================
    # GROWTH
    # ========================================================

    growth = report_data.get(
        "growth_trends",
        {},
    )

    add_section(
        "Growth Trends"
    )

    growth_rows = growth.get(
        "growth_trend",
        [],
    )

    if growth_rows:
        add_table(
            [
                "Date",
                "Followers",
                "Daily Growth",
                "Growth %",
                "Reach",
                "Engagement",
            ],
            [
                [
                    item.get(
                        "date",
                        "N/A",
                    ),
                    item.get(
                        "followers",
                        0,
                    ),
                    item.get(
                        "daily_growth",
                        0,
                    ),
                    item.get(
                        "growth_percentage",
                        0,
                    ),
                    item.get(
                        "reach",
                        0,
                    ),
                    item.get(
                        "engagement_rate",
                        0,
                    ),
                ]
                for item in growth_rows
            ],
        )

    # ========================================================
    # PLATFORM
    # ========================================================

    platform = report_data.get(
        "platform_comparison",
        {},
    )

    add_section(
        "Platform Comparison"
    )

    platform_rows = platform.get(
        "platform_comparison",
        {},
    )

    if platform_rows:
        add_table(
            [
                "Platform",
                "Views",
                "Reach",
                "Likes",
                "Comments",
                "Engagement",
            ],
            [
                [
                    platform_name,
                    values.get(
                        "views",
                        0,
                    ),
                    values.get(
                        "reach",
                        0,
                    ),
                    values.get(
                        "likes",
                        0,
                    ),
                    values.get(
                        "comments",
                        0,
                    ),
                    values.get(
                        "engagement_rate",
                        0,
                    ),
                ]
                for platform_name, values
                in platform_rows.items()
            ],
        )

    worksheet.freeze_panes = "A5"

    for column_cells in worksheet.columns:
        column_index = column_cells[0].column

        if column_index is None:
            continue

        column_letter = get_column_letter(
            column_index
        )

        max_length = 12

        for cell in column_cells:
            if cell.value is not None:
                max_length = max(
                    max_length,
                    len(str(cell.value)),
                )

        worksheet.column_dimensions[
            column_letter
        ].width = min(
            max_length + 2,
            45,
        )

    buffer = BytesIO()

    workbook.save(buffer)

    buffer.seek(0)

    return buffer


