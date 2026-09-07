from io import BytesIO

from openpyxl import Workbook
from openpyxl.styles import Font
from openpyxl.utils import get_column_letter

from app.services.reporting_service import generate_creator_report


def generate_excel_report(db, creator_id: int):

    report = generate_creator_report(
        db,
        creator_id
    )

    workbook = Workbook()

    # Remove default sheet
    sheet = workbook.active
    sheet.title = "Summary"

    # -------------------------------------------------
    # SUMMARY
    # -------------------------------------------------

    sheet["A1"] = "Creator Analytics Report"
    sheet["A1"].font = Font(bold=True, size=16)

    sheet["A2"] = "Creator ID"
    sheet["B2"] = creator_id

    summary = report["content_performance"]["summary"]

    summary_data = [
        ("Total Content", summary["total_content"]),
        ("Total Views", summary["total_views"]),
        ("Total Likes", summary["total_likes"]),
        ("Total Comments", summary["total_comments"]),
        ("Total Shares", summary["total_shares"]),
        ("Total Reach", summary["total_reach"]),
        (
            "Average Engagement Rate",
            summary["average_engagement_rate"]
        ),
        ("Best Platform", summary["best_platform"]),
        ("Top Content", summary["top_content"]),
    ]

    row = 4

    for label, value in summary_data:
        sheet.cell(row=row, column=1, value=label)
        sheet.cell(row=row, column=2, value=value)
        row += 1

    # -------------------------------------------------
    # TOP CONTENT
    # -------------------------------------------------

    top_sheet = workbook.create_sheet("Top Content")

    headers = [
        "Content",
        "Platform",
        "Views",
        "Reach",
        "Watch Time",
        "Engagement Rate"
    ]

    for column, header in enumerate(headers, start=1):
        cell = top_sheet.cell(
            row=1,
            column=column,
            value=header
        )
        cell.font = Font(bold=True)

    for row_index, content in enumerate(
        report["content_performance"]["top_content"],
        start=2
    ):
        values = [
            content["content_title"],
            content["platform"],
            content["views"],
            content["reach"],
            content["watch_time"],
            content["engagement_rate"],
        ]

        for column, value in enumerate(values, start=1):
            top_sheet.cell(
                row=row_index,
                column=column,
                value=value
            )

    # -------------------------------------------------
    # AUDIENCE
    # -------------------------------------------------

    audience_sheet = workbook.create_sheet("Audience")

    audience = report["audience_analytics"]

    audience_data = [
        ("Total Followers", audience["total_followers"]),
        ("Total Reach", audience["total_reach"]),
        ("Total Impressions", audience["total_impressions"]),
    ]

    for row_index, (label, value) in enumerate(
        audience_data,
        start=1
    ):
        audience_sheet.cell(
            row=row_index,
            column=1,
            value=label
        )
        audience_sheet.cell(
            row=row_index,
            column=2,
            value=value
        )

    # -------------------------------------------------
    # REVENUE
    # -------------------------------------------------

    revenue_sheet = workbook.create_sheet("Revenue")

    revenue = report["revenue_analytics"]

    revenue_sheet["A1"] = "Revenue Source"
    revenue_sheet["B1"] = "Amount"

    revenue_sheet["A1"].font = Font(bold=True)
    revenue_sheet["B1"].font = Font(bold=True)

    revenue_sheet["A2"] = "Total Revenue"
    revenue_sheet["B2"] = revenue["total_revenue"]

    row = 3

    for source, amount in revenue["revenue_by_source"].items():
        revenue_sheet.cell(
            row=row,
            column=1,
            value=source
        )
        revenue_sheet.cell(
            row=row,
            column=2,
            value=amount
        )
        row += 1

    # -------------------------------------------------
    # MONTHLY REVENUE
    # -------------------------------------------------

    monthly_sheet = workbook.create_sheet("Monthly Revenue")

    monthly_sheet["A1"] = "Month"
    monthly_sheet["B1"] = "Revenue"

    monthly_sheet["A1"].font = Font(bold=True)
    monthly_sheet["B1"].font = Font(bold=True)

    for row_index, item in enumerate(
        revenue["monthly_revenue"],
        start=2
    ):
        monthly_sheet.cell(
            row=row_index,
            column=1,
            value=item["month"]
        )
        monthly_sheet.cell(
            row=row_index,
            column=2,
            value=item["revenue"]
        )

    # -------------------------------------------------
    # GROWTH
    # -------------------------------------------------

    growth_sheet = workbook.create_sheet("Growth")

    growth_headers = [
        "Date",
        "Followers",
        "Daily Growth",
        "Growth Percentage"
    ]

    for column, header in enumerate(
        growth_headers,
        start=1
    ):
        cell = growth_sheet.cell(
            row=1,
            column=column,
            value=header
        )
        cell.font = Font(bold=True)

    for row_index, item in enumerate(
        report["growth_trends"],
        start=2
    ):
        values = [
            item["date"],
            item["followers"],
            item["daily_growth"],
            item["growth_percentage"],
        ]

        for column, value in enumerate(values, start=1):
            growth_sheet.cell(
                row=row_index,
                column=column,
                value=value
            )

    # -------------------------------------------------
    # PLATFORM COMPARISON
    # -------------------------------------------------

    platform_sheet = workbook.create_sheet(
        "Platform Comparison"
    )

    platform_headers = [
        "Platform",
        "Views",
        "Reach",
        "Engagement Rate",
        "Likes",
        "Comments"
    ]

    for column, header in enumerate(
        platform_headers,
        start=1
    ):
        cell = platform_sheet.cell(
            row=1,
            column=column,
            value=header
        )
        cell.font = Font(bold=True)

    for row_index, (
        platform,
        data
    ) in enumerate(
        report["platform_comparison"].items(),
        start=2
    ):
        values = [
            platform,
            data["views"],
            data["reach"],
            data["engagement_rate"],
            data["likes"],
            data["comments"],
        ]

        for column, value in enumerate(values, start=1):
            platform_sheet.cell(
                row=row_index,
                column=column,
                value=value
            )

    # -------------------------------------------------
    # AUTO WIDTH
    # -------------------------------------------------

    for worksheet in workbook.worksheets:

        for column_cells in worksheet.columns:

            max_length = 0

            column_letter = get_column_letter(
                column_cells[0].column
            )

            for cell in column_cells:
                if cell.value is not None:
                    max_length = max(
                        max_length,
                        len(str(cell.value))
                    )

            worksheet.column_dimensions[
                column_letter
            ].width = min(max_length + 2, 40)

    # -------------------------------------------------
    # SAVE TO MEMORY
    # -------------------------------------------------

    buffer = BytesIO()

    workbook.save(buffer)

    buffer.seek(0)

    return buffer