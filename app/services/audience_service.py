from collections import Counter
from datetime import date, timedelta
from sqlalchemy.orm import Session
from app.models.audience import Audience
from app.models.growth import Growth

def _distribution(rows, attr):
    counts=Counter(getattr(x, attr) for x in rows)
    total=sum(counts.values())
    return {k:round(v/total*100,2) for k,v in counts.items()} if total else {}

def report(db: Session):
    rows=db.query(Audience).all()
    gender=_distribution(rows,"gender"); age=_distribution(rows,"age_group"); countries=Counter(x.country for x in rows)
    cities=Counter(x.city for x in rows); devices=Counter(x.device_type for x in rows)
    return {"total_followers":sum(x.followers for x in rows),"total_reach":sum(x.reach for x in rows),
            "total_impressions":sum(x.impressions for x in rows),"gender_distribution":gender,
            "age_distribution":age,"top_countries":[{"country":k,"count":v} for k,v in countries.most_common(5)],
            "top_cities":[{"city":k,"count":v} for k,v in cities.most_common(5)],
            "device_usage":_distribution(rows,"device_type"),"top_country":countries.most_common(1)[0][0] if countries else None,
            "top_city":cities.most_common(1)[0][0] if cities else None,
            "top_device":devices.most_common(1)[0][0] if devices else None}

def growth_report(db: Session, days=30):
    rows=db.query(Growth).order_by(Growth.date.desc()).limit(days).all()
    rows=sorted(rows,key=lambda x:x.date)
    result=[]
    prev=None
    for g in rows:
        daily=g.followers-prev if prev is not None else 0
        pct=(daily/prev*100) if prev else 0
        result.append({"date":g.date.isoformat(),"followers":g.followers,"daily_growth":daily,"growth_percentage":round(pct,2)})
        prev=g.followers
    return result

def trends(db: Session, days=30):
    rows=db.query(Growth).order_by(Growth.date.desc()).limit(days).all()
    return [{"date":g.date.isoformat(),"followers":g.followers,"reach":g.reach} for g in sorted(rows,key=lambda x:x.date)]
