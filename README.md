# CreatorIQ — Creator Analytics & Content Performance Dashboard

CreatorIQ is a full-stack analytics platform that helps content creators track social media performance, audience engagement, content growth, and monetization insights through a centralized dashboard.

The system supports analytics visualization, content performance tracking, audience insights, engagement monitoring, revenue analytics, and multi-platform social media integration.

---

## 1. Project Overview

**Who it's for:** YouTubers, Instagram creators, streamers, influencer agencies, marketing teams, and content management organizations.

**What it does:**
- Tracks content performance across multiple social media platforms
- Calculates engagement rates, growth trends, and platform comparisons
- Tracks revenue, sponsorships, and monetization
- Sends performance/revenue alerts and notifications
- Generates downloadable PDF and Excel reports
- Provides a role-based, JWT-authenticated dashboard (Creator, Agency, Marketing Team, Administrator)

---

## 2. System Architecture

```
React Dashboard (Vite + Tailwind CSS)
        ↓ Axios (JWT Bearer token)
FastAPI Backend
        ↓ SQLAlchemy ORM
PostgreSQL Database
        ↑
Social Media Services (YouTube live API, Instagram mock/manual data)
```

**Backend layers:**
- `models/` — SQLAlchemy database models
- `schemas/` — Pydantic request/response validation
- `routers/` — API endpoint definitions
- `services/` — business logic and calculations (kept separate from routers)
- `core/` — configuration, security (JWT, password hashing), auth dependency
- `db/` — database connection/session setup

**Frontend layers:**
- `context/` — Auth state and theme (light/dark) providers
- `components/` — reusable UI (Layout, KpiCard, Modal, PlatformSelector, etc.)
- `pages/` — one page per dashboard module
- `api/` — Axios instance with automatic JWT attachment

---

## 3. Modules Implemented

| Module | Description |
|---|---|
| **User Management** | Registration, JWT login, role-based accounts (Creator, Agency, Marketing Team, Administrator) |
| **Content Analytics** | CRUD for content records; views, likes, comments, shares, saves, watch time, reach, engagement rate |
| **Audience Analytics** | Demographics (age, gender, country, city, device), follower/reach/impressions totals |
| **Growth & Trend Analysis** | 30-day follower growth report, audience trend chart data |
| **Revenue Analytics** | Revenue CRUD scoped per creator, revenue-by-source, monthly revenue, revenue trend chart |
| **Sponsorship Management** | Brand/campaign tracking, contract value, status, payment status |
| **Social Media Integration** | YouTube (live API), Instagram/LinkedIn/Twitter (documented mock data) — common data structure |
| **Analytics Dashboard** | KPI summary, engagement chart, follower chart, platform comparison (with growth rate) |
| **Notifications** | Auto-generated performance/engagement/revenue alerts, read/unread tracking |
| **Reports & Export** | Combined analytics report generation, PDF export, Excel export |

---

## 4. Tech Stack

**Backend:** Python, FastAPI, SQLAlchemy, Pydantic, Alembic, PostgreSQL
**Frontend:** React (Vite), Tailwind CSS, Axios, React Router, Recharts, Lucide Icons
**Auth:** JWT (python-jose), bcrypt password hashing (passlib)
**Reporting:** ReportLab (PDF), openpyxl (Excel)
**External APIs:** YouTube Data API v3

---

## 5. Database Tables

| Table | Purpose |
|---|---|
| `users` | Accounts, hashed passwords, roles |
| `content` | Multi-platform content records (common structure) |
| `audience` | Audience demographic segments |
| `growth` | Daily follower/reach/engagement history |
| `revenue` | Revenue entries by source |
| `sponsorship` | Brand deal tracking |
| `notification` | Generated alerts, read/unread status |
| `alembic_version` | Migration tracking |

---

## 6. Social Media Integration

### Implemented

**YouTube — Live API Integration**
Uses the real **YouTube Data API v3** (`search.list` + `videos.list`). Requires a `YOUTUBE_API_KEY` in `.env`. Fetches real video titles, views, likes, and comments; transforms them into CreatorIQ's common `Content` format.

**Known API limitations (not fabricated, left as 0):** `shares`, `saves`, `watch_time` — not exposed by the public YouTube Data API without OAuth-based YouTube Analytics API access.

**Instagram — Documented Mock Data**
Real Instagram Graph API access requires a linked Facebook Business account and Meta app review, which wasn't feasible to obtain within the sprint timeframe. Instagram data is generated via a dedicated `instagram_service.py` module that mirrors the exact structure a real API integration would use — the same sync workflow, deduplication logic, and common data format apply.

**Known limitations (explicitly set to 0, not invented):** `views`, `shares` — not exposed by Instagram's Graph API at standard permission tiers.

**LinkedIn — Documented Mock Data**
Built the same way as Instagram: a dedicated `linkedin_service.py` module generates data matching the common `Content` format, mirroring the sync/deduplication workflow a real LinkedIn API integration would use.

**Twitter/X — Documented Mock Data**
Also built as documented mock data via a dedicated `twitter_service.py` module, following the same common data structure and sync pattern as the other mock integrations.

### Planned (per original project scope, not yet implemented)
TikTok, Facebook — the original project brief scoped support for six platforms; YouTube (live API) plus Instagram, LinkedIn, and Twitter/X (documented mock data) now have working integrations in the current build.

### Common Platform Data Structure
Every platform integration (real or mock) transforms its data into the same shape before storage:

```
platform, external_content_id, content_title,
views, likes, comments, shares, saves, watch_time,
reach, published_date
```

This lets the existing analytics services (`analytics_service.py`) process any platform's data identically — no platform-specific analytics logic.

---

## 7. API Endpoints

### Authentication
- `POST /auth/login` — OAuth2 password login, returns JWT
- `GET /auth/me` — current user profile (protected)

### User Management
- `POST /users`, `GET /users`, `GET /users/search`, `GET /users/{id}`, `PUT /users/{id}`, `DELETE /users/{id}`

### Content Analytics
- `POST /content`, `GET /content` (supports `?platform=`), `GET /content/{id}`, `PUT /content/{id}`, `DELETE /content/{id}`

### Engagement Analytics
- `GET /analytics/summary` (supports `?platform=`)
- `GET /analytics/top-content` (supports `?platform=`)
- `GET /analytics/platform-performance`
- `GET /analytics/platform-comparison` — includes `growth_rate` per platform
- `GET /analytics/chart/engagement`, `GET /analytics/chart/followers`
- `GET /analytics/content/{id}/engagement`

### Audience Analytics
- `POST /audience`, `GET /audience`, `GET /audience/{id}`, `PUT /audience/{id}`, `DELETE /audience/{id}`
- `GET /analytics/audience`, `GET /analytics/growth`, `GET /analytics/audience-trends`

### Revenue & Sponsorships (creator-scoped, requires auth)
- `POST /revenue`, `GET /revenue`, `GET /revenue/{id}`, `PUT /revenue/{id}`, `DELETE /revenue/{id}`
- `GET /analytics/revenue`, `GET /analytics/revenue/trend`
- `POST /sponsorships`, `GET /sponsorships`, `GET /sponsorships/{id}`, `PUT /sponsorships/{id}`, `DELETE /sponsorships/{id}`

### Social Media Sync
- `POST /social/connect`, `GET /social/platforms`, `POST /social/sync` (simulated generic sync)
- `POST /social/youtube/sync` — real YouTube API sync
- `POST /social/instagram/sync` — mock Instagram sync

### Notifications
- `POST /notifications/generate`, `GET /notifications` (supports `?unread_only=`), `PUT /notifications/{id}/read`

### Reports
- `GET /reports/generate`, `GET /reports/export/pdf`, `GET /reports/export/excel`

---

## 8. Setup Instructions

### Backend

```bash
cd backend
python -m venv venv
.\venv\Scripts\Activate.ps1        # Windows
pip install -r requirements.txt
```

Create `.env` in `backend/`:
```
DATABASE_URL=postgresql://postgres:<password>@localhost:5432/creatoriq
SECRET_KEY=<random secret>
YOUTUBE_API_KEY=<your YouTube Data API v3 key>
```

Create the database in PostgreSQL, then run migrations:
```bash
alembic upgrade head
```

Run the server:
```bash
uvicorn app.main:app --reload
```
API docs available at `http://127.0.0.1:8000/docs`.

### Frontend

```bash
cd frontend
npm install
npm run dev
```
App available at `http://localhost:5173`.

---

## 9. Testing

Manual API testing was carried out against the live FastAPI server (via PowerShell `Invoke-RestMethod` and Swagger UI) and tracked in a dedicated test case spreadsheet, covering CRUD success/validation errors (422/404), authentication (401 for missing/invalid tokens), role-based access, duplicate-sync handling, platform filtering, and export file integrity.

**Status: 167/167 test cases Pass**, across Authentication, Role-Based Access, Profile, Content, Audience, Revenue, Notifications, Reports, Security, Performance, and Database modules. See the Known Issues section below for a couple of items surfaced during testing that are still open despite passing their originally-scoped test case.

---

## 10. Known Issues

A running bug/issue log is tracked separately during development and resolved before each milestone review. Notable items addressed during this project:
- Sync deduplication was corrected to scope by `creator_id` in addition to `platform` + `external_content_id`, preventing cross-creator data collisions.
- Duplicate notification generation was fixed by checking for an existing equivalent alert before creating a new one.
- Some analytics endpoints (Content, Audience, Growth) currently return platform-wide aggregates rather than creator-scoped data — flagged for follow-up alignment with Revenue/Sponsorship/Notifications, which are already creator-scoped. **Confirmed during API testing:** `GET /content` currently returns content across all creators regardless of the authenticated user's role (Creator, Agency, and Marketing Team all receive the same unscoped list) — needs a fix to filter by the requesting user where appropriate.
- **Confirmed during API testing:** the `role` field on `POST /users` has no enum/allow-list validation at the schema level, so any string value is currently accepted as a role rather than being restricted to `creator`, `agency`, `marketing_team`, `administrator`.

---

## 11. Project Status

| Milestone | Status |
|---|---|
| Milestone 1 — Initialization, Auth, Core Setup | Complete |
| Milestone 2 — Content Analytics & Social Media Integration | Complete |
| Milestone 3 — Revenue Analytics & Reporting | Complete |
| Milestone 4 — Testing, Deployment & Documentation | In progress |

---

## Author

**Harvi Gothi**
