from collections import defaultdict
from sqlalchemy.orm import Session
from app.models.revenue import Revenue

def summary(db: Session):
    rows=db.query(Revenue).all()
    by=defaultdict(float); monthly=defaultdict(float)
    for r in rows:
        by[r.source]+=r.amount; monthly[r.received_date.strftime("%Y-%m")]+=r.amount
    return {"total_revenue":round(sum(r.amount for r in rows),2),"revenue_by_source":dict(by),
            "monthly_revenue":dict(sorted(monthly.items()))}
