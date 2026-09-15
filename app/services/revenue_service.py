from collections import defaultdict

from sqlalchemy.orm import Session

from app.models.revenue import Revenue


def _creator_rows(db: Session, creator_id: int):
    return (
        db.query(Revenue)
        .filter(Revenue.creator_id == creator_id)
        .order_by(Revenue.received_date.asc(), Revenue.id.asc())
        .all()
    )


def summary(db: Session, creator_id: int | None = None):
    query = db.query(Revenue)

    if creator_id is not None:
        query = query.filter(Revenue.creator_id == creator_id)

    rows = query.order_by(
        Revenue.received_date.asc(),
        Revenue.id.asc(),
    ).all()

    by_source = defaultdict(float)
    monthly = defaultdict(float)

    for row in rows:
        by_source[row.source] += row.amount

        month = row.received_date.strftime("%Y-%m")
        monthly[month] += row.amount

    return {
        "creator_id": creator_id,
        "total_revenue": round(sum(row.amount for row in rows), 2),
        "revenue_by_source": {
            source: round(amount, 2)
            for source, amount in sorted(by_source.items())
        },
        "monthly_revenue": {
            month: round(amount, 2)
            for month, amount in sorted(monthly.items())
        },
    }


def revenue_by_source(db: Session, creator_id: int):
    rows = _creator_rows(db, creator_id)

    totals = defaultdict(float)

    for row in rows:
        totals[row.source] += row.amount

    return [
        {
            "source": source,
            "revenue": round(amount, 2),
        }
        for source, amount in sorted(totals.items())
    ]


def monthly_revenue(db: Session, creator_id: int):
    rows = _creator_rows(db, creator_id)

    totals = defaultdict(float)

    for row in rows:
        month = row.received_date.strftime("%Y-%m")
        totals[month] += row.amount

    return [
        {
            "month": month,
            "revenue": round(amount, 2),
        }
        for month, amount in sorted(totals.items())
    ]


def revenue_trend(db: Session, creator_id: int):
    data = monthly_revenue(db, creator_id)

    previous = None

    result = []

    for item in data:
        current = item["revenue"]

        if previous is None:
            change = 0
        elif previous == 0:
            change = 100 if current > 0 else 0
        else:
            change = round(
                ((current - previous) / previous) * 100,
                2,
            )

        result.append(
            {
                "month": item["month"],
                "revenue": current,
                "change_percentage": change,
            }
        )

        previous = current

    return result
