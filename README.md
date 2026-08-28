# CreatorIQ — Creator Analytics & Content Performance Platform

CreatorIQ is a full-stack creator analytics platform that helps content creators, agencies, and marketing teams track social media performance, audience growth, revenue, sponsorships, and reporting from a single dashboard.

This repository contains:

- **FastAPI backend** — authentication, content analytics, audience & growth, multi-platform social sync, YouTube Data API integration, revenue & sponsorships, notifications, and exportable reports
- **React frontend** — dashboard UI connected to the live backend APIs (Axios + Tailwind + Recharts)

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
9. [YouTube Integration](#9-youtube-integration)
10. [Setup & Installation](#10-setup--installation)
11. [Running the Application](#11-running-the-application)
12. [Frontend–Backend Flow](#12-frontendbackend-flow)
13. [Testing](#13-testing)
14. [Environment Variables](#14-environment-variables)
15. [Git Workflow](#15-git-workflow)

---

## 1. Project Overview

**Goal:** Build a centralized creator analytics system that stores content and audience metrics, computes engagement and growth insights, tracks revenue and sponsorships, and presents everything in a React dashboard.

**Primary users:** Creators, influencer agencies, marketing teams, and administrators.

**Design principle:** Business logic stays in the backend service layer. The frontend only consumes FastAPI endpoints and displays real PostgreSQL data — no hardcoded analytics values.

---

## 2. Features

### Authentication & users
- User registration and login (JWT)
- Role field on users (`creator`, `agency`, `marketing`, `admin` / project-compatible roles)
- Protected routes for revenue, sponsorships, notifications, and reports

### Content analytics
- Content CRUD (multi-platform records)
- Metrics: views, likes, comments, shares, saves, watch time, reach
- Engagement rate calculation  
  `(likes + comments + shares + saves) / reach × 100`  
  (falls back to views when reach is missing, e.g. YouTube public API)

### Engagement & dashboard analytics
- Per-content engagement API
- Top-performing content
- Platform performance / comparison
- KPI summary
- Chart-ready engagement and follower series

### Audience & growth
- Audience demographics CRUD
- Audience analytics report (gender, age, countries, devices)
- Growth history and trend APIs

### Social media workflow
- Simulated platform connect + sync for:
  - Instagram, Facebook, LinkedIn, TikTok, X (Twitter)
- Real **YouTube Data API** synchronization (API key)
- Upsert by platform + external content ID (no duplicate videos on re-sync)

### Revenue & sponsorships
- Revenue CRUD and source types (sponsorship, ads, affiliate, brand collab, subscription)
- Sponsorship tracking (brand, campaign, value, status, payment status)
- Revenue summary, by-source, monthly, and trend analytics
- Creator-scoped access (own data only)

### Notifications & reporting
- Notification model with read/unread status
- Performance, engagement, and revenue alerts generated from existing data
- Structured report generation (content, audience, revenue, growth, platform, full)
- **PDF** and **Excel** export for creator reports

### Frontend dashboard
- Login / register
- Sidebar layout
- Pages: Dashboard, Content, Audience, Growth, Revenue, Sponsorships, Notifications, Reports, Settings
- KPI cards, charts (Recharts), tables
- Loading and error states
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
YouTube Data API ──► youtube_service ──► content table
Mock platforms   ──► social_media     ──► content table
```

**Reporting / notifications path:**

```text
Content + Audience + Growth + Revenue (PostgreSQL)
        │
        ▼
analytics_service / audience_service / revenue_service
        │
        ▼
report_service / notification_service
        │
        ▼
JSON APIs + PDF/Excel downloads → React UI
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
| YouTube | YouTube Data API v3 (`google-api-python-client` / requests) |
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
│   │   │   ├── social.py
│   │   │   ├── revenue.py
│   │   │   ├── sponsorship.py
│   │   │   ├── notifications.py
│   │   │   └── reports.py
│   │   └── services/
│   │       ├── user_service.py
│   │       ├── analytics_service.py
│   │       ├── audience_service.py
│   │       ├── social_media.py
│   │       ├── youtube_service.py
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
│   │   │   └── charts/
│   │   └── pages/
│   │       ├── Login.jsx
│   │       ├── Register.jsx
│   │       ├── Dashboard.jsx
│   │       ├── Content.jsx
│   │       ├── Audience.jsx
│   │       ├── Growth.jsx
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

> Folder names may vary slightly in your clone (`creatoriq_backend`, etc.). Keep backend and frontend clearly separated.

---

## 6. Modules Implemented

| Sprint / area | Status |
|---------------|--------|
| Content analytics foundation (CRUD + validations) | Completed |
| Engagement analytics & performance reporting | Completed |
| Audience analytics & growth trends | Completed |
| Dashboard KPI/chart APIs + multi-platform mock sync | Completed |
| YouTube Data API sync + upsert | Completed |
| Revenue & sponsorship tracking | Completed |
| Notifications, alerts, PDF/Excel reports | Completed |
| React frontend & API integration | Completed |

---

## 7. API Overview

Interactive docs: **http://localhost:8000/docs**

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/register` | Register user |
| POST | `/auth/login` | Login (OAuth2 form: username = email) |

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
| GET | `/analytics/platform-performance` | Platform aggregates |
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
| POST | `/social/sync?platform=` | Mock sync → PostgreSQL |
| POST | `/social/youtube/sync` | Real YouTube sync |

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
| GET | `/reports/generate?report_type=&format=json\|excel\|pdf` | Generate or download |
| GET | `/reports/export/excel` | Excel file |
| GET | `/reports/export/pdf` | PDF file |

`report_type`: `full` | `content` | `audience` | `revenue` | `growth` | `platform`

---

## 8. Database

Primary database: **PostgreSQL**

Main tables:

| Table | Purpose |
|-------|---------|
| `users` | Accounts and roles |
| `content` | Per-platform content metrics (+ `external_content_id` for YouTube) |
| `audience` | Demographic / behavior snapshots |
| `growth` | Daily follower / engagement history |
| `revenue` | Earnings by source |
| `sponsorship` | Brand deals and payment status |
| `notifications` | Alerts and read/unread state |

Tables are created on application startup via SQLAlchemy `Base.metadata.create_all` (and/or Alembic migrations).

Verify in **pgAdmin** under the project database → Schemas → public → Tables.

---

## 9. YouTube Integration

### What is implemented
- Channel video fetch via **YouTube Data API v3**
- Transform into CreatorIQ common content format
- Store/update rows in `content` using `platform + external_content_id`
- Existing analytics APIs consume synced rows

### Authentication model used in this project
- **API key only** (no OAuth / YouTube Analytics API)

### Metrics available with API key
- Title, published date  
- Views, likes, comments  

### Metrics not available without OAuth Analytics API
- Real shares, watch time, thumbnail impressions/reach, saves  

For missing fields the system uses safe defaults / proxies (e.g. reach ≈ views when needed) so engagement and reports still work.

**Credentials** are loaded from `.env` (`YOUTUBE_API_KEY`). Never commit `.env` to GitHub.

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
```


### Frontend

```bash
cd frontend
npm install
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

Reports
   → GET /reports/generate
   → GET /reports/export/excel | /pdf
   → file download in browser

YouTube
   → POST /social/youtube/sync (Swagger or future UI action)
   → youtube_service → content table
   → analytics APIs refresh automatically from DB
```

---

## 13. Testing

### Backend
1. Open Swagger (`/docs`)
2. Register / login; use **Authorize** for protected routes
3. Exercise content → analytics → social sync → revenue → notifications → reports
4. Confirm rows in pgAdmin after creates/syncs
5. Re-run YouTube sync and confirm updates (not duplicates)

### Frontend
1. Login with a real backend user
2. Confirm Dashboard KPIs match Swagger `/analytics/summary`
3. Open each sidebar page; empty states should show when DB has no rows
4. Notifications → **Run alerts**
5. Reports → Generate JSON + Download Excel/PDF

---

## 14. Environment Variables

| Variable | Used by | Purpose |
|----------|---------|---------|
| `DATABASE_URL` | Backend | PostgreSQL connection |
| `SECRET_KEY` | Backend | JWT signing |
| `ALGORITHM` | Backend | JWT algorithm (e.g. HS256) |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | Backend | Token lifetime |
| `YOUTUBE_API_KEY` | Backend | YouTube Data API |
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
- [ ] YouTube sync tested (optional demo)  
- [ ] Report Excel/PDF download tested  

---
