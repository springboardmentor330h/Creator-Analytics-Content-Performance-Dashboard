# CreatorIQ — Creator Analytics & Content Performance Dashboard

A full-stack analytics platform for content creators to track content performance,
audience insights, revenue, and growth across multiple social media platforms
from a single dashboard.

---

## Tech Stack

**Backend:** Python, FastAPI, SQLAlchemy, PostgreSQL, Pydantic, bcrypt, python-jose (JWT),
reportlab, openpyxl, requests (YouTube Data API)

**Frontend:** React, Vite, React Router, Axios, Tailwind CSS, Recharts, lucide-react

---

## System Architecture

```
Browser
  ↓
React Frontend (Vite, :5173)
  ↓ Axios + JWT
FastAPI Backend (:8000)
  ↓ validate (Pydantic Schemas)
Service Layer (business logic / analytics calculations)
  ↓ query (SQLAlchemy ORM)
PostgreSQL (:5432)
```

Every value shown in the dashboard is fetched live from FastAPI, which computes it from
real PostgreSQL data — nothing in the frontend is hardcoded.

---

## Setup & Installation

### Prerequisites
- Python 3.11+
- Node.js 18+
- PostgreSQL running locally (or Docker)

### 1. Backend

```bash
cd backend  # or repo root, depending on your layout
python -m venv .venv
.venv\Scripts\activate        # Windows
source .venv/bin/activate     # macOS/Linux
pip install -r requirements.txt
```

Copy `.env.example` to `.env` and fill in real values:

```
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/creatoriq
SECRET_KEY=your-secret-key-here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=60
YOUTUBE_API_KEY=your-youtube-api-key
```

### 2. Start PostgreSQL

```bash
docker run -d --name creatoriq-db -e POSTGRES_USER=postgres -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=creatoriq -p 5432:5432 postgres:16
```

### 3. Apply migrations

```bash
alembic upgrade head
```

### 4. (Optional) Seed demo data

```bash
python seed_multiplatform.py
```

Creates a demo creator (`demo@creatoriq.dev` / `demo12345`) with realistic content,
audience, growth, revenue, and sponsorship data across all supported platforms.
Safe to re-run.

### 5. Frontend

```bash
cd frontend
npm install
```

Copy the frontend `.env` if needed (defaults to `http://127.0.0.1:8000`).

---

## Running the Project

| Terminal      | Command |
|---------------|---------|
| 1 — Database  | `docker start creatoriq-db` |
| 2 — Backend   | `uvicorn app.main:app --reload` |
| 3 — Frontend  | `cd frontend && npm run dev` |

- Backend API: `http://127.0.0.1:8000`
- Swagger docs: `http://127.0.0.1:8000/docs`
- Frontend dashboard: `http://localhost:5173`

Tables are created automatically on backend startup as a convenience (`Base.metadata.create_all`),
but the source of truth for schema changes is Alembic — run `alembic upgrade head` after pulling
any change that touches a model, and generate new revisions with:

```bash
alembic revision --autogenerate -m "describe the change"
```

Create your first user via `POST /users/` (or run `seed_multiplatform.py`), then log in from the frontend.

---

## Project Structure

```
app/
├── main.py            # Entry point, router registration
├── core/               # config, JWT auth, password hashing
├── db/                 # SQLAlchemy engine/session
├── models/             # Table definitions (User, Content, Audience, Growth,
│                        #   RevenueRecord, Sponsorship, Notification)
├── schemas/             # Pydantic request/response validation
├── services/            # Business logic & analytics calculations
└── routers/             # API endpoints

frontend/
├── src/
│   ├── pages/           # Dashboard, ContentAnalytics, AudienceAnalytics,
│   │                    #   GrowthTrends, Revenue, Sponsorships, SocialMedia,
│   │                    #   Notifications, Reports, Login
│   ├── components/      # Sidebar, Navbar, Layout, Card, StatusMessage
│   ├── context/         # AuthContext (JWT-based auth)
│   ├── routes/           # RoleGuard (auth protection)
│   └── api/              # Axios instance with JWT interceptor
```

---

## API Reference

Full interactive documentation: `http://127.0.0.1:8000/docs`

| Group | Endpoints |
|---|---|
| Auth | `/auth/login`, `/auth/me`, `/users` (CRUD) |
| Content | `/content` (CRUD) |
| Analytics | `/analytics/summary`, `/analytics/top-content`, `/analytics/platform-performance`, `/analytics/content/{id}/engagement` |
| Audience | `/audience` (CRUD), `/analytics/audience/{creator_id}`, `/analytics/audience/{creator_id}/locations`, `/analytics/audience/{creator_id}/active-hours` |
| Growth | `/growth` (CRUD), `/analytics/growth/{creator_id}`, `/analytics/growth/{creator_id}/platform-comparison` |
| Revenue | `/revenue` (CRUD), `/revenue/creator/{id}/summary`, `/monthly`, `/trend` |
| Sponsorships | `/sponsorships` (CRUD), `/sponsorships/creator/{id}/summary` |
| Social Media | `/social/platforms`, `/social/connect`, `/social/youtube/sync`, `/social/{platform}/sync` |
| Notifications | `/notifications/generate/{id}`, `/notifications/creator/{id}`, `/{id}/read` |
| Reports | `/reports/creator/{id}/generate`, `/reports/creator/{id}/pdf`, `/reports/creator/{id}/excel` |
| Admin | `/admin/overview`, `/admin/top-creators`, `/admin/top-content`, `/admin/recent-signups` |

---

## Admin Control Center

Logging in as an `Administrator` redirects straight to `/admin`, which loads a completely
separate area of the app: its own layout and sidebar
(`frontend/src/components/admin/AdminLayout.jsx` + `AdminSidebar.jsx`), with no creator-facing
navigation in it at all. It's made up of six dedicated pages under `frontend/src/pages/admin/`:

| Page | Route | What it shows |
|---|---|---|
| Overview | `/admin` | Platform-wide stat cards, role distribution chart, quick links to every other admin page |
| Users & Roles | `/admin/users` | Promote/demote any account's role, suspend/reactivate, or remove a user |
| Top Creators | `/admin/creators` | Leaderboard ranked by total views, with content count, engagement, top platform |
| Top Content by Platform | `/admin/content` | Best-engagement content per platform, browsable by tab |
| Cross-Platform Comparison | `/admin/comparison` | Aggregate views/likes/comments/reach/engagement across every creator, per platform, as both a chart and a full table |
| Recent Activity | `/admin/activity` | Newest signups, with one-click promote/suspend actions |

Backend support lives in `app/routers/admin.py` + `app/services/admin_service.py`
(`/admin/overview`, `/admin/top-creators`, `/admin/top-content`, `/admin/recent-signups`),
plus the existing `PUT/DELETE /users/{id}` and `GET /users/search` endpoints for role/status
changes. Every `/admin/*` route is gated with `require_roles(UserRole.ADMINISTRATOR)`, and the
`/admin` frontend routes are wrapped in an `AdminGuard` that redirects non-admins back to `/`.
Admins can't edit their own row in Users & Roles, so there's no accidental self-lockout.

**Getting your first Administrator account:** there's no admin-only signup form (registration
always creates a `Creator`), so the backend bootstraps one automatically — **the first account
created while the system has zero Administrators becomes one**, regardless of the role it
asked for (`UserService.create` in `app/services/user_service.py`). In practice: register
through the normal `/register` page, and if no admin exists yet, that account *is* the admin.
From then on, that admin can promote anyone else from `/admin/users`.

---

## Notes on data sources

- **YouTube** content sync calls the real YouTube Data API v3 (requires `YOUTUBE_API_KEY`).
- **Other platforms** (Instagram, TikTok, Facebook, LinkedIn, X) use generated mock data
  matching each platform's real response shape, since live API access requires
  per-platform developer approval.
- Metrics a platform doesn't actually report are stored as `NULL` in the database (not `0`) —
  e.g. YouTube's Data API doesn't expose `shares` or a `reach` figure, so those columns are
  left `NULL` for YouTube content. This keeps "unknown" distinguishable from "genuinely zero"
  in every average/sum computed in `analytics_service.py`.
- Duplicate detection on sync is done via `(platform, external_content_id)`.

---

## Authorization model

Every creator-scoped endpoint (content, audience, growth, revenue, sponsorships,
notifications, reports) requires a valid JWT and enforces ownership: a `Creator`/`Agency`/
`Marketing Team` user can only read or write data for their own `creator_id` (their own
user id). `Administrator` accounts bypass this check and can access any creator's data,
or omit `creator_id` on dashboard/analytics endpoints to see aggregate data across everyone.
Account registration (`POST /users/`) is intentionally public; everything else requires
`Authorization: Bearer <token>`.

---

## Database Migrations

Schema changes are tracked with Alembic (`alembic/versions/`). The initial migration
captures the full schema as of this version, including the nullable-metrics design above.

---

## Author

Aadyth V K — CreatorIQ Project
