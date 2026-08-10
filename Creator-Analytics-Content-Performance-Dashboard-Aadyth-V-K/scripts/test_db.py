import sys
from pathlib import Path

# Ensure project root is on sys.path so `app` package can be imported when
# running this script directly from the `creatoriq` folder.
ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))

from sqlalchemy import text
from app.db.database import engine


def main():
    with engine.begin() as conn:
        conn.execute(text(
            "CREATE TABLE IF NOT EXISTS test_table (id INTEGER PRIMARY KEY, name TEXT)"
        ))
        conn.execute(text("INSERT INTO test_table (name) VALUES (:name)"), {"name": "alice"})
        result = conn.execute(text("SELECT id, name FROM test_table"))
        for row in result:
            print(row.id, row.name)


if __name__ == "__main__":
    main()
