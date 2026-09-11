from sqlalchemy import text
from sqlalchemy.orm import Session


def reset_sequence(db: Session, table_name: str, column_name: str = "id"):
    """Reset a table's sequence to MAX(id) + 1."""
    db.execute(text(f"""
        SELECT setval(
            pg_get_serial_sequence('{table_name}', '{column_name}'),
            COALESCE((SELECT MAX({column_name}) FROM {table_name}), 1)
        )
    """))
    db.commit()


def fix_all_sequences(db: Session):
    """Reset ALL sequences in the public schema to match their tables."""
    rows = db.execute(text("""
        SELECT pg_get_serial_sequence(t.table_name, 'id') AS seq_name,
               t.table_name
        FROM information_schema.columns t
        WHERE t.table_schema = 'public'
          AND t.column_name = 'id'
          AND t.column_default LIKE 'nextval%%'
    """)).fetchall()

    for seq_name, table_name in rows:
        if seq_name is None:
            continue
        db.execute(text(f"""
            SELECT setval(
                '{seq_name}',
                COALESCE((SELECT MAX(id) FROM {table_name}), 1)
            )
        """))
    db.commit()
    print(f"✅ Fixed {len(rows)} sequences.")


if __name__ == "__main__":
    from app.database import SessionLocal

    db = SessionLocal()
    fix_all_sequences(db)
    db.close()   