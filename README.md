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
- ✅ **Sprint 6 — Revenue & sponsorship analytics**: revenue/sponsorship CRUD, Alembic migrations.
- ✅ **Sprint 7 — Notifications, reporting & export**: alerts, cross-sprint reports, PDF/Excel export.

All 7 sprints complete.

### Post-Sprint-7 — Dashboard integration, UI overhaul, multi-platform expansion

Additional work completed after Sprint 7 at the mentor's request:

- **Full frontend rebuild**: every page now uses a shared `AppLayout`
  (sidebar + top header) instead of duplicated layout code. Added
  `PageHeader`, `PlatformSelector`, `StatusBadge`, and loading/empty/error
  state components, reused consistently across all pages.
- **4 new pages**: Growth & Trends, standalone Sponsorships (extracted
  from Revenue), standalone Notifications, Profile/Settings.
- **Dashboard rebuilt**: was a Sprint-1 placeholder; now shows real KPIs,
  charts, and top content pulled from existing backend services — no
  hardcoded numbers.
- **Platform selector**: added to Content Analytics, Audience Analytics,
  and Growth & Trends, filtering real data via existing backend query
  params where supported, or client-side aggregation of already-computed
  backend values where the backend has no per-platform filter (documented
  in code comments — never inventing filtered results the backend can't
  produce).
- **Instagram added as a second platform** with realistic sample data
  seeded into PostgreSQL via the existing `Content`/`AudienceGrowth`
  models (see "Multi-platform data" below) — not a live API integration,
  since Instagram's Graph API requires business-app review this project
  doesn't have access to.
- **Two real bugs found and fixed via live end-to-end browser testing**
  (not just `npm run build`): a CORS origin mismatch between `localhost`
  and `127.0.0.1`, and a frontend request exceeding the backend's
  pagination limit. See `docs/post-sprint-7.md` for full details.

## Multi-platform data

- **YouTube**: real data via the Data API v3 (Sprint 5) — a creator
  triggers a sync from the Dashboard, pulling actual channel/video stats.
- **Instagram**: realistic sample data, deterministically generated and
  stored in PostgreSQL through the same `Content`/`AudienceGrowth` models
  YouTube uses (`instagram_sample_data_service.py`). Internally
  consistent (impressions ≥ reach, engagement rate in a realistic 1–9%
  band, follower growth trending upward with natural noise). Triggered
  from the Dashboard; safe to re-run (updates existing rows instead of
  duplicating).
- **TikTok**: no data source yet — clearly labeled `is_mock_data: true`
  wherever it appears, using the original Sprint 4 mock generator.

Every platform flows through the **same** `content_service`,
`audience_service`, and `platform_analytics_service` functions — there
is no per-platform duplicate analytics logic anywhere in the codebase.

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

## Dashboard pages

Dashboard · Content Analytics · Audience Analytics · Growth & Trends ·
Platform Comparison · Revenue · Sponsorships · Notifications · Reports ·
Profile/Settings — all behind authentication, all pulling real data from
the backend (no hardcoded frontend values).

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
