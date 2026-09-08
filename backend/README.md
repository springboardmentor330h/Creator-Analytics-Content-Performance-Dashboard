# CreatorIQ Backend

FastAPI + PostgreSQL + SQLAlchemy backend.

## Setup

```bash
cd backend
python -m venv venv
source venv/bin/activate      # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env          # then edit .env with your real DB URL / secret key
```

## Database

Create the database in PostgreSQL first:

```bash
psql -U postgres -c "CREATE DATABASE creatoriq;"
```

Tables are auto-created on app startup for now (Sprint 1–5). Alembic migrations
are introduced in Sprint 6.

As of Sprint 6, schema is managed via Alembic migrations — run this
before starting the app for the first time, and after pulling any
change that touches a model:

```bash
alembic upgrade head
```

(`create_all()` still runs on app startup as a harmless safety net —
see the comment in `app/main.py` — but migrations are the real source
of truth going forward.)

To create a new migration after changing a model:

```bash
alembic revision --autogenerate -m "describe the change"
# review the generated file in alembic/versions/ before applying —
# autogenerate is a strong starting point, not infallible
alembic upgrade head
```

## Run

```bash
uvicorn app.main:app --reload
```

- API: http://localhost:8000
- Swagger docs: http://localhost:8000/docs

## Test

```bash
pytest
```
