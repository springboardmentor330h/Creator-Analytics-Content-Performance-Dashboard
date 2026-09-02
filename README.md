# CreatorIQ — Creator Analytics & Content Performance Dashboard

A full-stack dashboard for content creators to track engagement, audience
growth, multi-platform performance, revenue, and sponsorships — with
automated PDF/Excel reporting.

Built independently as an internship project, sprint by sprint. See
`docs/sprint-1.md` onward for what shipped in each sprint.

## Status

- ✅ **Sprint 1 — Foundation**: auth (JWT), roles, protected routing, dashboard shell.
- ✅ **Sprint 2 — Content & engagement analytics**: content CRUD, engagement rate, top content, platform comparison.
- ✅ **Sprint 3 — Audience & growth analytics**: demographics, growth trends, growth rate.
- ✅ **Sprint 4 — Multi-platform analytics**: normalized cross-platform comparison, mock data layer.
- ✅ **Sprint 5 — YouTube API integration**: real channel/video sync, idempotent, quota-aware.
- ⬜ Sprint 6 — Revenue & sponsorship analytics
- ⬜ Sprint 4 — Multi-platform analytics
- ⬜ Sprint 5 — YouTube API integration
- ⬜ Sprint 6 — Revenue & sponsorship analytics
- ⬜ Sprint 7 — Notifications, reporting & export

## Architecture

```
Router → Schema → Service → Model → Database
```

- **Router**: HTTP layer — request/response, status codes.
- **Schema**: Pydantic — validates and shapes API input/output.
- **Service**: business logic — DB queries, rules.
- **Model**: SQLAlchemy ORM — maps to actual PostgreSQL tables.

Backend: FastAPI, SQLAlchemy, PostgreSQL, JWT auth.
Frontend: React, Vite, React Router, Axios, Recharts.

## Project structure

```
Creator_IQ/
├── backend/          FastAPI app (see backend/README.md)
├── frontend/          React app (see frontend/README.md)
├── docs/              Sprint-by-sprint documentation
├── docker-compose.yml PostgreSQL for local dev
└── .gitignore
```

## Quick start

```bash
# 1. Start PostgreSQL
docker compose up -d

# 2. Backend
cd backend
python -m venv venv && source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
uvicorn app.main:app --reload

# 3. Frontend (new terminal)
cd frontend
npm install
npm run dev
```

Visit `http://localhost:5173`. API docs at `http://localhost:8000/docs`.

## Testing

```bash
cd backend
pytest
```

## Environment variables

See `backend/.env.example`. Never commit a real `.env` — it's gitignored.

## Development note

This project was built independently, without copying, cloning, or
reproducing code from any other intern's repository or branch.
