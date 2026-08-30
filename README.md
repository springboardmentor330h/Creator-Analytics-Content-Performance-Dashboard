# CreatorIQ — Creator Analytics & Content Performance Platform

CreatorIQ is a full-stack creator analytics platform that helps content creators, agencies, and marketing teams track social media performance, audience growth, revenue, sponsorships, and reporting from a single dashboard.

This repository contains:

- **FastAPI backend** — authentication, content analytics, audience & growth, multi-platform social sync, YouTube Data API integration, Instagram Graph API integration, revenue & sponsorships, notifications, and exportable reports
- **React frontend** — dashboard UI connected to the live backend APIs (Axios + Tailwind + Recharts), including a multi-platform comparison view

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Features](#2-features)
3. [System Architecture](#3-system-architecture)
4. [Tech Stack](#4-tech-stack)
5. [Project Structure](#5-project-structure)
6. [Modules Implemented](#6-modules-implemented)
7. [API Overview](#7-api-overview)
8. [Database](#8-database)
9. [Social Media Integrations](#9-social-media-integrations)
10. [Setup & Installation](#10-setup--installation)
11. [Running the Application](#11-running-the-application)
12. [Frontend–Backend Flow](#12-frontendbackend-flow)
13. [Testing](#13-testing)
14. [Environment Variables](#14-environment-variables)
15. [Git Workflow](#15-git-workflow)

---

## 1. Project Overview

**Goal:** Build a centralized creator analytics system that stores content and audience metrics, computes engagement and growth insights, tracks revenue and sponsorships, and presents everything — across multiple social platforms — in a React dashboard.

**Primary users:** Creators, influencer agencies, marketing teams, and administrators.

**Design principle:** Business logic stays in the backend service layer. The frontend only consumes FastAPI endpoints and displays real PostgreSQL data — no hardcoded analytics values. Every platform's data is normalized into one common content format so analytics, reports, and dashboards work identically regardless of which platform the data came from.

---

## 2. Features

### Authentication & users
- User registration and login (JWT)
- Role field on users (`Creator`, `Agency`, `Marketing Team`, `Administrator`)
- Protected routes for revenue, sponsorships, notifications, reports, and social sync
- Creator-scoped data access — creators only ever see/modify their own records; administrators can access all

### Content analytics
- Content CRUD (multi-platform records)
- Metrics: views, likes, comments, shares, saves, watch time, reach
- Engagement rate calculation
  `(likes + comments + shares + saves) / reach × 100`
  (falls back to views when reach is missing, e.g. YouTube public API)

### Engagement & dashboard analytics
- Per-content engagement API
- Top-performing content
- Platform performance / comparison (per-platform views, likes, comments, shares, reach, average engagement rate)
- KPI summary
- Chart-ready engagement and follower series

### Audience & growth
- Audience demographics CRUD
- Audience analytics report (gender, age, countries, devices)
- Growth history and trend APIs

### Social media workflow
- **Real YouTube Data API** synchronization (API key)
- **Real Instagram Graph API** synchronization (Page access token → linked Instagram Business account), including:
  - Media + insights sync into the common content format
  - Business Discovery lookup of other public Instagram Business/Creator accounts
- Upsert by `platform + external_content_id` (no duplicate content on re-sync), with ownership checks so one creator's sync can't overwrite another creator's synced content

### Revenue & sponsorships
- Revenue CRUD and source types (sponsorship, ads, affiliate, brand collab, subscription)
- Sponsorship tracking (brand, campaign, value, status, payment status)
- Revenue summary, by-source, monthly, and trend analytics
- Creator-scoped access (own data only)

### Notifications & reporting
- Notification model with read/unread status
- Performance, engagement, and revenue alerts generated from existing data
- Structured report generation (content, audience, revenue, growth, platform, full) — correctly scoped to the requesting creator only
- **PDF** and **Excel** export for creator reports

### Frontend dashboard
- Login / register
- Sidebar layout 
- Pages: Dashboard, Content, Audience, Growth, **Compare Platforms**, Revenue, Sponsorships, Notifications, Reports, Settings
- Platform selector (filter Dashboard/Content by platform, or view "All Platforms")
- **Platform Comparison page** — side-by-side bar charts and a table comparing views/likes/comments/shares/reach/engagement rate across every synced platform
- KPI cards, charts (Recharts), tables
- Live notification bell with polling, mark-read / mark-all-read
- Loading, error, and empty states across every page
- Report download buttons (PDF / Excel)

---

## 3. System Architecture

```text
React Dashboard (Vite)
        │
        │  Axios + JWT
        ▼
FastAPI (routers → services)
        │
        ▼
PostgreSQL
        ▲
        │
YouTube Data API    ──► youtube_service     ──► content table
Instagram Graph API ──► instagram_service   ──► content table
```

**Reporting / notifications path:**

```text
Content + Audience + Growth + Revenue (PostgreSQL)
        │
        ▼
analytics_service / audience_service / revenue_service
   (creator_id-scoped for reports; global for admin/legacy dashboards)
        │
        ▼
report_service / notification_service
        │
        ▼
JSON APIs + PDF/Excel downloads → React UI
```

**Platform comparison path:**

```text
content table (platform column)
        │
        ▼
GET /analytics/platform-performance
        │
        ▼
Platform Comparison page (React) → charts + table
```

---

## 4. Tech Stack

| Layer | Technology |
|-------|------------|
| Backend language | Python 3 |
| API framework | FastAPI |
| ORM | SQLAlchemy |
| Validation | Pydantic |
| Auth | JWT (python-jose), OAuth2 password flow, passlib/bcrypt |
| Database | PostgreSQL |
| Migrations | Alembic (baseline migration present) |
| YouTube | YouTube Data API v3 |
| Instagram | Meta Graph API (Page access token + linked IG Business account) |
| Export | openpyxl (Excel), reportlab (PDF) |
| Frontend | React 18, Vite |
| Routing | React Router |
| HTTP client | Axios |
| Styling | Tailwind CSS |
| Charts | Recharts |
| Dev tools | Swagger UI (`/docs`), Postman, pgAdmin, VS Code, GitHub |

---

## 5. Project Structure

```text
creatoriq/
├── backend/                      # FastAPI application
│   ├── app/
│   │   ├── main.py
│   │   ├── core/
│   │   │   ├── config.py
│   │   │   ├── auth.py
│   │   │   └── security.py
│   │   ├── db/
│   │   │   ├── database.py
│   │   │   └── init_db.py
│   │   ├── models/
│   │   │   ├── user.py
│   │   │   ├── content.py
│   │   │   ├── audience.py
│   │   │   ├── growth.py
│   │   │   ├── revenue.py
│   │   │   ├── sponsorship.py
│   │   │   └── notification.py
│   │   ├── schemas/
│   │   │   ├── user.py
│   │   │   ├── content.py
│   │   │   ├── audience.py
│   │   │   ├── growth.py
│   │   │   ├── revenue.py
│   │   │   ├── sponsorship.py
│   │   │   ├── notification.py
│   │   │   └── report.py
│   │   ├── routers/
│   │   │   ├── auth.py
│   │   │   ├── users.py
│   │   │   ├── content.py
│   │   │   ├── analytics.py
│   │   │   ├── audience.py
│   │   │   ├── social.py              # connect / YouTube / Instagram
│   │   │   ├── revenue.py
│   │   │   ├── sponsorship.py
│   │   │   ├── notifications.py
│   │   │   └── reports.py
│   │   └── services/
│   │       ├── user_service.py
│   │       ├── analytics_service.py
│   │       ├── audience_service.py
│   │       ├── social_media.py        
│   │       ├── youtube_service.py     # real YouTube Data API
│   │       ├── instagram_service.py   # real Meta Graph API
│   │       ├── revenue_service.py
│   │       ├── sponsorship_service.py
│   │       ├── notification_service.py
│   │       └── report_service.py
│   ├── alembic/
│   ├── requirements.txt
│   ├── .env                  # local only — not committed
│   └── .gitignore
│
├── frontend/                     # React dashboard
│   ├── src/
│   │   ├── main.jsx
│   │   ├── App.jsx
│   │   ├── index.css
│   │   ├── context/AuthContext.jsx
│   │   ├── services/api.js
│   │   ├── components/
│   │   │   ├── layout/Layout.jsx
│   │   │   ├── ui/
│   │   │   │   ├── KPICard.jsx
│   │   │   │   ├── Loading.jsx
│   │   │   │   ├── ErrorBox.jsx
│   │   │   │   └── PlatformSelect.jsx
│   │   │   └── charts/
│   │   │       └── SimpleCharts.jsx   # includes GroupedBar for comparison
│   │   └── pages/
│   │       ├── Login.jsx
│   │       ├── Register.jsx
│   │       ├── Dashboard.jsx          # includes platform filter
│   │       ├── Content.jsx            # includes platform filter
│   │       ├── Audience.jsx
│   │       ├── Growth.jsx
│   │       ├── PlatformComparison.jsx # NEW — multi-platform comparison view
│   │       ├── Revenue.jsx
│   │       ├── Sponsorships.jsx
│   │       ├── Notifications.jsx
│   │       ├── Reports.jsx
│   │       └── Settings.jsx
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── .env.example
│   └── README.md
│
└── README.md                     # this file
```

> Folder names may vary slightly in your clone (`creatoriq_backend`, `creatoriq_frontend`, etc.). Keep backend and frontend clearly separated.

---

## 6. Modules Implemented

| Sprint / area | Status |
|---------------|--------|
| Content analytics foundation (CRUD + validations) | Completed |
| Engagement analytics & performance reporting | Completed |
| Audience analytics & growth trends | Completed |
| Dashboard KPI/chart APIs + multi-platform | Completed |
| YouTube Data API sync + upsert | Completed |
| Revenue & sponsorship tracking | Completed |
| Notifications, alerts, PDF/Excel reports | Completed |
| React frontend & API integration | Completed |
| **Instagram Graph API integration (real data)** | **Completed** |
| **Platform selector + multi-platform comparison view** | **Completed** |

---

## 7. API Overview

Interactive docs: **http://localhost:8000/docs**

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/register` | Register user |
| POST | `/auth/login` | Login (OAuth2 form: username = email) |
| GET | `/auth/me` | Get logged-in user's profile |

### Content
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/content` | Create content |
| GET | `/content` | List content |
| GET | `/content/{id}` | Get by ID |
| PUT | `/content/{id}` | Update |
| DELETE | `/content/{id}` | Delete |

### Analytics
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/analytics/content/{id}/engagement` | Engagement for one item |
| GET | `/analytics/top-content` | Top content by engagement |
| GET | `/analytics/platform-performance` | Per-platform aggregates (powers the Compare Platforms page) |
| GET | `/analytics/summary` | KPI summary |
| GET | `/analytics/chart/engagement` | Chart labels/values |
| GET | `/analytics/chart/followers` | Follower chart data |
| GET | `/analytics/platform-comparison` | Platform comparison object |

### Audience & growth
| Method | Endpoint | Description |
|--------|----------|-------------|
| CRUD | `/audience` | Audience records |
| GET | `/analytics/audience` | Audience report |
| GET | `/analytics/growth` | Growth report |
| GET | `/analytics/audience-trends` | Trend series |

### Social
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/social/connect` | Connect platform (simulated) |
| GET | `/social/platforms` | List connected platforms |
| POST | `/social/youtube/sync` | Real YouTube sync (auth required, creator-scoped) |
| POST | `/social/instagram/sync` | Real Instagram sync via Meta Graph API (auth required, creator-scoped) |
| GET | `/social/instagram/discover` | Look up a public Instagram Business account by username (auth required) |

### Revenue & sponsorships
| Method | Endpoint | Description |
|--------|----------|-------------|
| CRUD | `/revenue` | Revenue (auth, own data) |
| GET | `/revenue/analytics/summary` | Revenue summary |
| GET | `/revenue/analytics/monthly` | Monthly series |
| GET | `/revenue/analytics/trend` | Trend |
| CRUD | `/sponsorships` | Sponsorships (auth, own data) |

### Notifications
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/notifications` | List (own) |
| POST | `/notifications/alerts/run` | Generate alerts from data |
| PATCH | `/notifications/{id}/read` | Mark read |
| POST | `/notifications/read-all` | Mark all read |

### Reports
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/reports/generate?report_type=&format=json\|excel\|pdf` | Generate or download (creator-scoped) |
| GET | `/reports/export/excel` | Excel file |
| GET | `/reports/export/pdf` | PDF file |

`report_type`: `full` \| `content` \| `audience` \| `revenue` \| `growth` \| `platform`

---

## 8. Database

Primary database: **PostgreSQL**

Main tables:

| Table | Purpose |
|-------|---------|
| `users` | Accounts and roles |
| `content` | Per-platform content metrics (+ `external_content_id` for YouTube/Instagram) |
| `audience` | Demographic / behavior snapshots |
| `growth` | Daily follower / engagement history |
| `revenue` | Earnings by source |
| `sponsorship` | Brand deals and payment status |
| `notifications` | Alerts and read/unread state |

Tables are created on application startup via SQLAlchemy `Base.metadata.create_all` and/or Alembic migrations.

Verify in **pgAdmin** under the project database → Schemas → public → Tables.

---

## 9. Social Media Integrations

### YouTube (real — API key)
- Channel video fetch via **YouTube Data API v3**
- Transform into CreatorIQ common content format
- Store/update rows in `content` using `platform + external_content_id`
- **Metrics available:** title, published date, views, likes, comments
- **Metrics not available** without OAuth Analytics API: real shares, watch time, impressions/reach, saves — the system uses safe defaults/proxies (e.g. reach ≈ views) rather than assuming a value

### Instagram (real — Meta Graph API)
- Uses a **Page access token** plus the Page's linked Instagram Business/Creator account
- Fetches recent media and (where permitted) per-media insights (impressions, reach, engagement, saves)
- Falls back gracefully across a few metric-set combinations, since Graph API insight availability varies by account type/permissions
- Transforms into the same common content format used by YouTube
- Supports **Business Discovery** — looking up another public Business/Creator account's follower count and recent media by username
- All sync/discover endpoints require login; `creator_id` is taken from the authenticated user's token, never from client input, and a media item already owned by one creator cannot be silently re-owned by another


**Credentials** are loaded from `.env` (`YOUTUBE_API_KEY`, `IG_ACCESS_TOKEN`, `IG_USER_ID`). Never commit `.env` to GitHub.

---

## 10. Setup & Installation

### Prerequisites
- Python 3.10+ recommended
- Node.js 18+
- PostgreSQL
- Git

### Backend

```bash
cd backend
python -m venv venv

# Windows
venv\Scripts\activate

# macOS / Linux
source venv/bin/activate

pip install -r requirements.txt
```

Create `.env`:

```env
DATABASE_URL=postgresql://USER:PASSWORD@localhost:5432/creatoriq_db
SECRET_KEY=change-this-to-a-long-random-string
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=60
YOUTUBE_API_KEY=your_youtube_data_api_key

# Instagram (Meta Graph API) — optional, only needed to sync real Instagram data
IG_ACCESS_TOKEN=your_page_access_token
IG_USER_ID=your_linked_instagram_business_account_id
```

### Frontend

```bash
cd frontend
npm install
```

Create `.env` (from `.env.example`):

```env
VITE_API_URL=http://localhost:8000
```

---

## 11. Running the Application

### Start backend

```bash
cd creatoriq_backend
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

- API: http://localhost:8000
- Swagger: http://localhost:8000/docs
- Health: http://localhost:8000/health

### Start frontend

```bash
cd creatoriq_frontend
npm run dev
```

- UI: http://localhost:5173

### CORS
Allow the Vite origin on the FastAPI app if browser requests are blocked:

```python
allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"]
```

---

## 12. Frontend–Backend Flow

```text
Login (React)
   → POST /auth/login
   → store JWT
   → Axios Authorization: Bearer <token>

Dashboard pages
   → GET /analytics/*, /content, /revenue, ...
   → PostgreSQL via FastAPI services
   → charts / tables / KPI cards
   → platform selector filters client-side using already-fetched /content data

Compare Platforms page
   → GET /analytics/platform-performance
   → grouped bar charts + comparison table, one row per platform

Reports
   → GET /reports/generate
   → GET /reports/export/excel | /pdf
   → file download in browser

YouTube / Instagram sync
   → POST /social/youtube/sync | POST /social/instagram/sync
   → youtube_service / instagram_service → content table
   → analytics + comparison APIs refresh automatically from DB
```

---

## 13. Testing

### Backend
1. Open Swagger (`/docs`)
2. Register / login; use **Authorize** for protected routes
3. Exercise content → analytics → social sync (YouTube, Instagram) → revenue → notifications → reports
4. Confirm rows in pgAdmin after creates/syncs
5. Re-run YouTube/Instagram sync and confirm updates (not duplicates)
6. Register a second user and confirm they cannot see/modify the first user's revenue, sponsorships, or reports (`403`/empty results)

### Frontend
1. Login with a real backend user
2. Confirm Dashboard KPIs match Swagger `/analytics/summary`
3. Open each sidebar page; empty states should show when DB has no rows
4. Use the platform selector on Dashboard/Content and confirm the numbers change correctly
5. Open **Compare Platforms** and confirm it matches `/analytics/platform-performance` in Swagger
6. Notifications → **Run alerts**
7. Reports → Generate JSON + Download Excel/PDF

---

## 14. Environment Variables

| Variable | Used by | Purpose |
|----------|---------|---------|
| `DATABASE_URL` | Backend | PostgreSQL connection |
| `SECRET_KEY` | Backend | JWT signing |
| `ALGORITHM` | Backend | JWT algorithm (e.g. HS256) |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | Backend | Token lifetime |
| `YOUTUBE_API_KEY` | Backend | YouTube Data API |
| `IG_ACCESS_TOKEN` | Backend | Meta Graph API auth for Instagram sync |
| `IG_USER_ID` | Backend | Instagram Business/Creator account ID (resolved from Page if omitted) |
| `VITE_API_URL` | Frontend | FastAPI base URL |

---

## 15. Git Workflow

Suggested `.gitignore` entries:

```gitignore
.env
venv/
__pycache__/
*.pyc
node_modules/
dist/
.DS_Store
```

## Quick Start Checklist

- [ ] PostgreSQL running and `DATABASE_URL` set
- [ ] Backend venv + `pip install -r requirements.txt`
- [ ] `.env` configured (no secrets in Git)
- [ ] `uvicorn app.main:app --reload --port 8000`
- [ ] Swagger login works
- [ ] Frontend `npm install` + `VITE_API_URL`
- [ ] `npm run dev` → login → dashboard shows API data
- [ ] YouTube sync tested 
- [ ] Instagram sync tested 
- [ ] Compare Platforms page shows real per-platform data
- [ ] Report Excel/PDF download tested

---