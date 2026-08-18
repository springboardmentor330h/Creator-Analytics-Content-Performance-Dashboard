from datetime import date, timedelta

from app.db.database import SessionLocal
from app.models.growth import Growth


db = SessionLocal()

creators = [2, 3, 5]

start_date = date(2026, 7, 16)

rows = []

for creator_id in creators:
    for day in range(30):

        current_date = start_date + timedelta(days=day)

        followers = (
            80000
            + (creator_id * 5000)
            + (day * 700)
        )

        reach = (
            12000
            + (creator_id * 1500)
            + (day * 350)
        )

        engagement_rate = round(
            4.2 + ((day % 5) * 0.25),
            2
        )

        rows.append(
            Growth(
                creator_id=creator_id,
                date=current_date,
                followers=followers,
                reach=reach,
                engagement_rate=engagement_rate
            )
        )


db.add_all(rows)
db.commit()

print("Growth records added:", len(rows))
print(
    "Total growth records:",
    db.query(Growth).count()
)

db.close()
