from sqlalchemy import func
from sqlalchemy.orm import Session

from app.models.revenue import Revenue


# ============================================================
# INTERNAL QUERY HELPER
# ============================================================

def _apply_creator_filter(
    query,
    creator_id: int | None,
):
    """
    Apply creator filtering only when creator_id is supplied.

    creator_id provided:
        Only that creator.

    creator_id is None:
        All creators.
    """

    if creator_id is not None:
        query = query.filter(
            Revenue.creator_id == creator_id
        )

    return query


# ============================================================
# TOTAL REVENUE
# ============================================================

def get_total_revenue(
    db: Session,
    creator_id: int | None = None,
) -> float:
    """
    Creator:
        Total revenue for that creator.

    Administrator:
        Total revenue across all creators.
    """

    query = db.query(
        func.coalesce(
            func.sum(Revenue.amount),
            0.0,
        )
    )

    query = _apply_creator_filter(
        query,
        creator_id,
    )

    total = query.scalar()

    return round(
        float(total or 0),
        2,
    )


# ============================================================
# REVENUE BY SOURCE
# ============================================================

def get_revenue_by_source(
    db: Session,
    creator_id: int | None = None,
) -> list[dict]:
    """
    Group revenue by source.

    Creator:
        Own revenue.

    Administrator:
        Revenue from all creators.
    """

    query = db.query(
        Revenue.source,
        func.coalesce(
            func.sum(Revenue.amount),
            0.0,
        ).label("total_amount"),
    )

    query = _apply_creator_filter(
        query,
        creator_id,
    )

    rows = (
        query
        .group_by(
            Revenue.source
        )
        .order_by(
            func.sum(
                Revenue.amount
            ).desc()
        )
        .all()
    )

    return [
        {
            "source": row.source,
            "total_amount": round(
                float(
                    row.total_amount or 0
                ),
                2,
            ),
        }
        for row in rows
    ]


# ============================================================
# MONTHLY REVENUE
# ============================================================

def get_monthly_revenue(
    db: Session,
    creator_id: int | None = None,
) -> list[dict]:
    """
    Monthly revenue.

    Creator:
        Own revenue.

    Administrator:
        Combined revenue from all creators.
    """

    query = db.query(
        Revenue.date,
        Revenue.amount,
    )

    query = _apply_creator_filter(
        query,
        creator_id,
    )

    rows = (
        query
        .order_by(
            Revenue.date.asc()
        )
        .all()
    )

    monthly_totals: dict[str, float] = {}

    for row in rows:

        if not row.date:
            continue

        month_key = row.date.strftime(
            "%Y-%m"
        )

        monthly_totals[month_key] = (
            monthly_totals.get(
                month_key,
                0.0,
            )
            + float(
                row.amount or 0
            )
        )

    return [
        {
            "month": month,
            "total_amount": round(
                total,
                2,
            ),
        }
        for month, total
        in sorted(
            monthly_totals.items()
        )
    ]


# ============================================================
# REVENUE TREND
# ============================================================

def get_revenue_trend(
    db: Session,
    creator_id: int | None = None,
) -> dict:
    """
    Chart-ready revenue trend.
    """

    monthly = get_monthly_revenue(
        db,
        creator_id,
    )

    return {
        "labels": [
            row["month"]
            for row in monthly
        ],
        "values": [
            row["total_amount"]
            for row in monthly
        ],
    }


# ============================================================
# REVENUE SUMMARY
# ============================================================

def get_revenue_summary(
    db: Session,
    creator_id: int | None = None,
) -> dict:
    """
    Combined revenue summary.

    Creator:
        Own revenue.

    Administrator:
        All creators.
    """

    count_query = db.query(
        func.count(Revenue.id)
    )

    count_query = _apply_creator_filter(
        count_query,
        creator_id,
    )

    total_records = (
        count_query.scalar()
        or 0
    )

    return {
        "total_revenue": (
            get_total_revenue(
                db,
                creator_id,
            )
        ),
        "total_records": int(
            total_records
        ),
        "revenue_by_source": (
            get_revenue_by_source(
                db,
                creator_id,
            )
        ),
    }