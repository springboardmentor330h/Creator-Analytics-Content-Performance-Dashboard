from io import BytesIO

from openpyxl import Workbook
from openpyxl.styles import Font, Alignment
from openpyxl.utils import get_column_letter


def generate_excel_report(report_data: dict):
    workbook = Workbook()

    # --------------------------------------------------
    # SUMMARY SHEET
    # --------------------------------------------------

    summary_sheet = workbook.active
    summary_sheet.title = "Summary"

    summary_sheet["A1"] = "CreatorIQ Analytics Report"
    summary_sheet["A1"].font = Font(
        bold=True,
        size=18
    )

    summary_sheet["A3"] = "Metric"
    summary_sheet["B3"] = "Value"

    summary_sheet["A3"].font = Font(bold=True)
    summary_sheet["B3"].font = Font(bold=True)

    summary = report_data.get("summary", {})

    summary_rows = [
        ("Total Views", summary.get("total_views", 0)),
        ("Total Likes", summary.get("total_likes", 0)),
        ("Total Comments", summary.get("total_comments", 0)),
        ("Total Shares", summary.get("total_shares", 0)),
        ("Total Reach", summary.get("total_reach", 0)),
        ("Total Followers", summary.get("total_followers", 0)),
        (
            "Average Engagement Rate",
            summary.get("average_engagement_rate", 0)
        )
    ]

    row_number = 4

    for metric, value in summary_rows:
        summary_sheet.cell(
            row=row_number,
            column=1,
            value=metric
        )

        summary_sheet.cell(
            row=row_number,
            column=2,
            value=value
        )

        row_number += 1

    # --------------------------------------------------
    # CONTENT PERFORMANCE SHEET
    # --------------------------------------------------

    content_sheet = workbook.create_sheet(
        "Content Performance"
    )

    content_headers = [
        "Content ID",
        "Title",
        "Platform",
        "Views",
        "Likes",
        "Comments",
        "Shares",
        "Saves",
        "Reach",
        "Engagement Rate"
    ]

    for column_number, header in enumerate(
        content_headers,
        start=1
    ):
        cell = content_sheet.cell(
            row=1,
            column=column_number,
            value=header
        )

        cell.font = Font(bold=True)

    for row_number, content in enumerate(
        report_data.get("content_performance", []),
        start=2
    ):
        values = [
            content.get("content_id"),
            content.get("title"),
            content.get("platform"),
            content.get("views", 0),
            content.get("likes", 0),
            content.get("comments", 0),
            content.get("shares", 0),
            content.get("saves", 0),
            content.get("reach", 0),
            content.get("engagement_rate", 0)
        ]

        for column_number, value in enumerate(
            values,
            start=1
        ):
            content_sheet.cell(
                row=row_number,
                column=column_number,
                value=value
            )

    # --------------------------------------------------
    # AUDIENCE ANALYTICS SHEET
    # --------------------------------------------------

    audience_sheet = workbook.create_sheet(
        "Audience Analytics"
    )

    audience = report_data.get(
        "audience_analytics",
        {}
    )

    audience_sheet["A1"] = "Audience Analytics"
    audience_sheet["A1"].font = Font(
        bold=True,
        size=16
    )

    audience_sheet["A3"] = "Metric"
    audience_sheet["B3"] = "Value"

    audience_sheet["A3"].font = Font(bold=True)
    audience_sheet["B3"].font = Font(bold=True)

    audience_metrics = [
        (
            "Total Followers",
            audience.get("total_followers", 0)
        ),
        (
            "Total Reach",
            audience.get("total_reach", 0)
        ),
        (
            "Total Impressions",
            audience.get("total_impressions", 0)
        )
    ]

    row_number = 4

    for metric, value in audience_metrics:
        audience_sheet.cell(
            row=row_number,
            column=1,
            value=metric
        )

        audience_sheet.cell(
            row=row_number,
            column=2,
            value=value
        )

        row_number += 1

    # Gender distribution

    row_number += 1

    audience_sheet.cell(
        row=row_number,
        column=1,
        value="Gender Distribution"
    ).font = Font(bold=True)

    row_number += 1

    audience_sheet.cell(
        row=row_number,
        column=1,
        value="Gender"
    ).font = Font(bold=True)

    audience_sheet.cell(
        row=row_number,
        column=2,
        value="Percentage"
    ).font = Font(bold=True)

    row_number += 1

    for gender, percentage in audience.get(
        "gender_distribution",
        {}
    ).items():

        audience_sheet.cell(
            row=row_number,
            column=1,
            value=gender
        )

        audience_sheet.cell(
            row=row_number,
            column=2,
            value=percentage
        )

        row_number += 1

    # --------------------------------------------------
    # REVENUE ANALYTICS SHEET
    # --------------------------------------------------

    revenue_sheet = workbook.create_sheet(
        "Revenue Analytics"
    )

    revenue = report_data.get(
        "revenue_analytics",
        {}
    )

    revenue_sheet["A1"] = "Revenue Analytics"
    revenue_sheet["A1"].font = Font(
        bold=True,
        size=16
    )

    revenue_sheet["A3"] = "Total Revenue"
    revenue_sheet["B3"] = revenue.get(
        "total_revenue",
        0
    )

    revenue_sheet["A3"].font = Font(bold=True)

    revenue_sheet["A5"] = "Revenue by Source"
    revenue_sheet["A5"].font = Font(bold=True)

    revenue_sheet["A6"] = "Source"
    revenue_sheet["B6"] = "Amount"

    revenue_sheet["A6"].font = Font(bold=True)
    revenue_sheet["B6"].font = Font(bold=True)

    row_number = 7

    for source, amount in revenue.get(
        "revenue_by_source",
        {}
    ).items():

        revenue_sheet.cell(
            row=row_number,
            column=1,
            value=source
        )

        revenue_sheet.cell(
            row=row_number,
            column=2,
            value=amount
        )

        row_number += 1

    # Revenue transactions

    row_number += 2

    revenue_sheet.cell(
        row=row_number,
        column=1,
        value="Transactions"
    ).font = Font(bold=True)

    row_number += 1

    transaction_headers = [
        "ID",
        "Source",
        "Amount",
        "Currency",
        "Description",
        "Revenue Date"
    ]

    for column_number, header in enumerate(
        transaction_headers,
        start=1
    ):
        revenue_sheet.cell(
            row=row_number,
            column=column_number,
            value=header
        ).font = Font(bold=True)

    row_number += 1

    for transaction in revenue.get(
        "transactions",
        []
    ):

        values = [
            transaction.get("id"),
            transaction.get("source"),
            transaction.get("amount"),
            transaction.get("currency"),
            transaction.get("description"),
            transaction.get("revenue_date")
        ]

        for column_number, value in enumerate(
            values,
            start=1
        ):
            revenue_sheet.cell(
                row=row_number,
                column=column_number,
                value=value
            )

        row_number += 1

    # --------------------------------------------------
    # GROWTH TRENDS SHEET
    # --------------------------------------------------

    growth_sheet = workbook.create_sheet(
        "Growth Trends"
    )

    growth_headers = [
        "Date",
        "Followers",
        "Daily Growth",
        "Growth Percentage"
    ]

    for column_number, header in enumerate(
        growth_headers,
        start=1
    ):
        growth_sheet.cell(
            row=1,
            column=column_number,
            value=header
        ).font = Font(bold=True)

    for row_number, growth in enumerate(
        report_data.get("growth_trends", []),
        start=2
    ):

        values = [
            growth.get("date"),
            growth.get("followers", 0),
            growth.get("daily_growth", 0),
            growth.get("growth_percentage", 0)
        ]

        for column_number, value in enumerate(
            values,
            start=1
        ):
            growth_sheet.cell(
                row=row_number,
                column=column_number,
                value=value
            )

    # --------------------------------------------------
    # PLATFORM COMPARISON SHEET
    # --------------------------------------------------

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

    for column_number, header in enumerate(
        platform_headers,
        start=1
    ):
        platform_sheet.cell(
            row=1,
            column=column_number,
            value=header
        ).font = Font(bold=True)

    for row_number, platform in enumerate(
        report_data.get("platform_comparison", []),
        start=2
    ):

        values = [
            platform.get("platform"),
            platform.get("views", 0),
            platform.get("reach", 0),
            platform.get("engagement_rate", 0),
            platform.get("likes", 0),
            platform.get("comments", 0)
        ]

        for column_number, value in enumerate(
            values,
            start=1
        ):
            platform_sheet.cell(
                row=row_number,
                column=column_number,
                value=value
            )

    # --------------------------------------------------
    # FORMAT ALL SHEETS
    # --------------------------------------------------

    for sheet in workbook.worksheets:

        for column_cells in sheet.columns:

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

            sheet.column_dimensions[
                column_letter
            ].width = min(
                max_length + 2,
                40
            )

        for row in sheet.iter_rows():

            for cell in row:
                cell.alignment = Alignment(
                    vertical="top"
                )

    # --------------------------------------------------
    # SAVE WORKBOOK TO MEMORY
    # --------------------------------------------------

    buffer = BytesIO()

    workbook.save(buffer)

    buffer.seek(0)

    return buffer