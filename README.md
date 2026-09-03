# CreatorIQ — Creator Analytics & Content Performance Dashboard

A full-stack analytics platform for content creators, agencies, and marketing teams to track content performance, audience insights, revenue, and growth across multiple social media platforms from a single dashboard.

---

## Table of Contents
- [Project Overview](#project-overview)
- [Tech Stack](#tech-stack)
- [System Architecture](#system-architecture)
- [Setup & Installation](#setup--installation)
- [Running the Project](#running-the-project)
- [Sprint-by-Sprint Development Summary](#sprint-by-sprint-development-summary)
- [Project Structure](#project-structure)
- [API Reference](#api-reference)

---

## Project Overview

CreatorIQ centralizes performance data scattered across YouTube, Instagram, TikTok, Facebook, LinkedIn, and X into one dashboard, giving creators a single place to see:

- Content performance (views, likes, comments, shares, watch time, reach)
- Engagement analytics (engagement rate, top-performing content, platform comparison)
- Audience demographics (age, gender, location, device, active hours)
- Growth & trend analysis (follower growth, hashtag trends, reach prediction)
- Revenue & sponsorship tracking (multiple revenue sources)
- Notifications and exportable reports (PDF/Excel)
- Role-based dashboards (Creator, Agency, Marketing Team, Admin)

---

## Tech Stack

**Backend:** Python, FastAPI, SQLAlchemy, PostgreSQL (Docker), Pydantic, Alembic, bcrypt, python-jose (JWT), reportlab, openpyxl, google-api-python-client

**Frontend:** React, Vite, React Router, Axios, Tailwind CSS, Recharts, lucide-react

---

## System Architecture
Browser
↓
React Frontend (Vite, :5173)
↓ Axios + JWT
FastAPI Backend (:8000)
↓ validate (Pydantic Schemas)
Service Layer (business logic / analytics calculations)
↓ query (SQLAlchemy ORM)
PostgreSQL (Docker, :5432)


Every value shown in the dashboard is fetched live from FastAPI, which computes it from real PostgreSQL data.

---

## Setup & Installation

### Prerequisites
- Python 3.11+
- Node.js 18+
- Docker Desktop

### 1. Clone and configure
```bash
git clone <repo-url>
cd CreatorIQ/backend
```
Create `.env` in `backend/`:

DATABASE_URL=postgresql+psycopg://postgres:postgres@localhost:5432/creatoriq
SECRET_KEY=your-secret-key-here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=60
YOUTUBE_API_KEY=your-youtube-api-key


### 2. Start PostgreSQL
```bash
docker run -d --name creatoriq-db -e POSTGRES_USER=postgres -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=creatoriq -p 5432:5432 postgres:16
```

### 3. Backend
```bash
cd backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
python -m alembic upgrade head
```

### 4. Frontend
```bash
cd frontend
npm install
```

---

## Running the Project

| Terminal      |    |Command |
|---------------|-------------|
| 1 — Database  | `docker start creatoriq-db` |
| 2 — Backend   | `cd backend && .venv\Scripts\activate && python -m uvicorn app.main:app --reload` |
| 3 — Frontend  | `cd frontend && npm run dev` |

- Backend API: `http://127.0.0.1:8000`
- Swagger docs: `http://127.0.0.1:8000/docs`
- Frontend dashboard: `http://localhost:5173`

**Seed sample data (optional, recommended for demos):**
```bash
cd backend
python seed_multiplatform.py
```
Generates ~120 content records, 90 days of growth history, 40 revenue records, and 25 audience records across all platforms via real API calls.

---

## Sprint-by-Sprint Development Summary

### Milestone 1 — Foundation & Authentication

**Week 1–2: Project Initialization**
- Set up FastAPI backend and React frontend project structure
- Configured PostgreSQL (Docker) and SQLAlchemy ORM
- Built role-selection based access (Creator, Agency, Marketing Team, Admin) as an interim step before full authentication

**Sprint: Authentication System**
- Implemented password hashing with bcrypt
- Implemented JWT-based authentication (`/auth/login` issues signed tokens)
- Built protected route dependencies (`get_current_user`, `get_current_role`)
- Replaced role-selection with real login using hashed credentials

**Sprint: Content Analytics Foundation**
- Built `Content` model, schema (with validation: min title length, no negative values), and full CRUD API (`POST/GET/PUT/DELETE /content`)

---

### Milestone 2 — Content Analytics & Social Media Integration

**Sprint 2: Engagement Analytics & Performance Reporting**
- Built `analytics_service.py` — engagement rate calculation, top-performing content ranking, platform performance comparison, dashboard summary
- Implemented `/analytics/content/{id}/engagement`, `/analytics/top-content`, `/analytics/platform-performance`, `/analytics/summary`

**Sprint 3: Audience Analytics & Growth Trends**
- Built `Audience` and `Growth` models with full CRUD
- Built `audience_service.py` — demographic distributions (age, gender), top countries/cities, device usage, growth trend reports
- Implemented `/analytics/audience`, `/analytics/growth`, `/analytics/audience-trends`

**Sprint 4: Dashboard Analytics APIs & Multi-Platform Workflow**
- Built KPI summary, chart-ready engagement/follower endpoints (`/analytics/chart/engagement`, `/analytics/chart/followers`)
- Built platform comparison API
- Implemented simulated social media connection workflow (`/social/connect`, `/social/platforms`, `/social/sync`) with mock data across 6 platforms

**Sprint 5: Real YouTube API Integration**
- Built `youtube_service.py` — real YouTube Data API v3 integration (search, channel videos, video statistics)
- Transformed YouTube responses into CreatorIQ's common content format
- Implemented `/social/youtube/sync` with duplicate detection via `(platform, external_content_id)`
- Verified existing analytics APIs work seamlessly with real synced data

**Multi-Platform Sprint: Additional Platform Integration**
- Extended the common data format across Instagram, TikTok, Facebook, LinkedIn, and X
- Used mock data (matching each platform's real API response shape) where live API access required approval/credentials not yet available
- Added platform selector and platform comparison view to the React dashboard
- Handled platform-specific unavailable metrics as `NULL` (never invented/approximated)
- Built `seed_multiplatform.py` to generate sufficient, realistic multi-platform historical data

---

### Milestone 3 — Revenue Analytics & Reporting

**Sprint 6: Revenue & Sponsorship Management**
- Built `RevenueRecord` and `Sponsorship` models with full CRUD
- Built `revenue_service.py` — revenue summary, monthly breakdown, trend detection, sponsorship summary
- Added ownership-based access control (creators can only access their own revenue/sponsorship data; admins can access all)
- Set up Alembic for database migrations (credentials loaded from `.env`, never hardcoded)

**Sprint 7: Notifications, Reporting & Exportable Reports + Frontend Integration**
- Built persisted `Notification` model with read/unread tracking
- Implemented performance and revenue alert generation (statistical outlier detection)
- Built combined report generator reusing existing analytics/revenue services (no duplicate logic)
- Implemented PDF export (reportlab) and Excel export (openpyxl) for content, audience, and revenue reports
- Built complete React frontend: Dashboard, Content Analytics, Audience Analytics, Growth & Trends, Revenue, Sponsorships, Notifications, Reports pages
- Connected all pages to real backend APIs — zero hardcoded analytics values in the frontend
- Made the UI responsive (mobile sidebar, adaptive grid layouts)

**Sprint 8: Final Integration, Testing & Deployment**
- End-to-end testing across all modules (auth → content → analytics → audience → growth → revenue → notifications → reports)
- Fixed null-value handling across analytics aggregations (platforms with unavailable metrics)
- Verified database records in pgAdmin/psql after every sync and CRUD operation
- Documentation finalized (this README)

---

## Project Structure
backend/
├── app/
│ ├── main.py # Entry point, router registration
│ ├── config.py # .env loading
│ ├── database.py # SQLAlchemy engine/session
│ ├── models/ # Table definitions
│ ├── schemas/ # Request/response validation
│ ├── services/ # Business logic & analytics
│ ├── routers/ # API endpoints
│ └── core/ # JWT, bcrypt, auth dependencies
├── alembic/ # DB migrations
├── seed_multiplatform.py # Bulk test data generator
└── requirements.txt

frontend/
├── src/
│ ├── pages/ # Dashboard, ContentAnalytics, AudienceAnalytics,
│ │ # GrowthTrends, Revenue, Notifications, Reports,
│ │ # SocialMedia, PlatformComparison, Login
│ ├── components/ # Sidebar, Navbar
│ ├── context/ # RoleContext (auth), CreatorContext
│ ├── routes/ # RoleGuard (auth protection)
│ └── api/ # Axios instance with JWT interceptor


---

## API Reference

Full interactive documentation: `http://127.0.0.1:8000/docs`

| Group | Endpoints |
|---|---|
| Auth | `/auth/users`, `/auth/login`, `/auth/users/search` |
| Content | `/content` (CRUD), `/content/bulk` |
| Analytics | `/analytics/summary`, `/analytics/top-content`, `/analytics/platform-comparison`, `/analytics/chart/engagement`, `/analytics/chart/followers` |
| Audience | `/audience` (CRUD), `/analytics/audience`, `/analytics/audience-trends` |
| Growth | `/growth` (CRUD), `/analytics/growth`, `/growth-trends/*` |
| Revenue | `/revenue` (CRUD), `/revenue/creator/{id}/summary`, `/monthly`, `/trend` |
| Sponsorships | `/sponsorships` (CRUD), `/sponsorships/creator/{id}/summary` |
| Social Media | `/social/connect`, `/social/platforms`, `/social/youtube/sync`, `/social/{platform}/sync` |
| Notifications | `/notifications/generate/{id}`, `/notifications/creator/{id}`, `/{id}/read` |
| Reports | `/reports/creator/{id}/generate`, `/reports/content/pdf/{id}`, `/reports/content/excel/{id}` |

---

## Author

Bhushan Khedekar — CreatorIQ Internship Project