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
