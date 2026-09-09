# CreatorIQ – Creator Analytics & Content Performance Dashboard

## Project Overview

CreatorIQ is a full-stack analytics platform designed to help content creators, agencies, influencers, and digital marketers track multi-platform social media performance, audience engagement, growth trends, and monetization insights through a centralized dashboard.

The API is built with **FastAPI** and **PostgreSQL**, following a layered architecture that separates routing, business logic, and data access.

---

## 🚀 Key Features & Modules

### 👤 1. User & Access Management
* **Role-Based Access Control (RBAC):** Distinct roles for Creators, Agencies, Marketing Teams, and Administrators.
* **Authentication:** JWT-based authentication, OAuth2 social logins, and secure password hashing.
* **Profile Management:** Creator profile setups, agency management, and account settings.

### 📊 2. Content Analytics
* **Performance Metrics:** Track Views, Likes, Comments, Shares, Saves, Watch Time, Reach, and Engagement Rate.
* **Content Comparison & Ranking:** Compare performance across posts and identify top-performing content.
* **Trend Analysis:** Monitor reach analysis and long-term content performance trends.

### 👥 3. Audience Insights
* **Demographic Breakdown:** Detailed records by Age, Gender, Geographic Location (Country/City), and Device Usage.
* **Audience Growth:** Track follower growth rates, impressions, active hours, and engagement behavior.

### 📈 4. Growth & Trend Forecasting
* **Trend & Hashtag Analysis:** Identify trending topics and top-performing hashtags.
* **Predictive Insights:** Content growth tracking, reach predictions, and audience growth forecasting.

### 💰 5. Revenue & Monetization Analytics
* **Revenue Tracking:** Track income from Sponsorships, Ad Revenue, Affiliate Marketing, Brand Collaborations, and Subscriptions.
* **Financial Insights:** Monitor monetization trends, earn reports, and revenue performance over time.

### 🔄 6. Social Media Integration
* **Multi-Platform Support:** API integration with **YouTube**, **Instagram**, **TikTok**, **Facebook**, **X (Twitter)**, and **LinkedIn**.
* **Data Syncing:** Scheduled synchronization and unified data formatting across platforms.

### 📱 7. Interactive Dashboard & Reporting
* **Visualizations:** Interactive charts powered by Chart.js / Recharts with KPI monitoring and real-time updates.
* **Alerts & Exporting:** Automated performance alerts, scheduled email digests, and PDF/Excel report exports.

---

## 🏗️ System Architecture

---

```
Client (Swagger / Postman / React Dashboard)
              │
              ▼
        FastAPI Routers
   (users, auth, content, analytics,
        audience, social)
              │
              ▼
        Service Layer
 (business logic & calculations)
              │
              ▼
      SQLAlchemy Models
              │
              ▼
        PostgreSQL Database
```
---

## Modules Implemented

| Module | Description |
|---|---|
| **Authentication** | User registration, login, JWT-based authentication and password hashing |
| **Users** | User account management |
| **Content** | CRUD for content performance records (views, likes, comments, shares, saves, watch time, reach) |
| **Analytics** | Engagement rate calculation, top-content ranking, platform performance, KPI summary, chart-ready data, platform comparison |
| **Audience** | Audience demographic records (age, gender, country, city, device) and audience-level analytics |
| **Growth** | Daily historical follower/reach/engagement tracking and growth trend reporting |
| **Social Media** | Simulated multi-platform connection workflow with mock data, plus real YouTube Data API synchronization |

---

## APIs Implemented

### Authentication
- `POST /auth/register` – Register a new user
- `POST /auth/login` – Authenticate and receive a JWT token

### Content
- `POST /content` – Create a content record
- `GET /content` – List all content records
- `GET /content/{id}` – Get a content record by ID
- `PUT /content/{id}` – Update a content record
- `DELETE /content/{id}` – Delete a content record

### Analytics
- `GET /analytics/content/{content_id}/engagement` – Engagement rate for a single content item
- `GET /analytics/top-content` – Top 5 content items ranked by engagement rate
- `GET /analytics/platform-performance` – Aggregated performance grouped by platform
- `GET /analytics/summary` – Dashboard KPI summary (views, likes, comments, shares, reach, followers, avg. engagement rate)
- `GET /analytics/chart/engagement` – Chart-ready engagement rate over time
- `GET /analytics/chart/followers` – Chart-ready follower growth over time
- `GET /analytics/platform-comparison` – Side-by-side comparison of all platforms

### Audience & Growth
- `POST /audience`, `GET /audience`, `GET /audience/{id}`, `PUT /audience/{id}`, `DELETE /audience/{id}` – Audience record CRUD
- `POST /growth`, `GET /growth`, `GET /growth/{id}`, `PUT /growth/{id}`, `DELETE /growth/{id}` – Growth record CRUD
- `GET /analytics/audience` – Audience demographic report (followers, reach, impressions, gender/age distribution, top countries/cities, device usage)
- `GET /analytics/growth` – 30-day growth report (daily growth and growth %)
- `GET /analytics/audience-trends` – Chart-ready follower/reach trend data

### Social Media
- `POST /social/connect` – Simulate connecting a social media account
- `GET /social/platforms` – List connected platforms
- `POST /social/youtube/sync` – Fetch real data from the YouTube Data API, transform it, and store/update it in PostgreSQL

---

## Database Tables

| Table | Purpose |
|---|---|
| `users` | Registered user accounts and credentials |
| `content` | Content performance records per platform (views, likes, comments, shares, saves, watch time, reach, published date) |
| `audience` | Audience demographic and behavior data (age group, gender, country, city, device, active hour) |
| `growth` | Daily historical follower count, reach, and engagement rate |

All tables are created automatically on application startup and are visible under **pgAdmin → public → Tables**.

---

## Data Transformation Workflow

Every platform's raw response is mapped into a single common format before being stored, so the analytics layer never needs platform-specific logic:

```
platform
external_content_id
content_title
views
likes
comments
shares
reach
published_date
```

This format is designed to be extensible — Instagram, TikTok, Facebook, LinkedIn, and X can be added later by writing a new `*_service.py` file that produces the same shape, with no changes required to the analytics APIs.

---

## Synchronization Workflow

`POST /social/youtube/sync?creator_id={id}&channel_id={channel}&max_results={n}`:

1. Validates `creator_id` and `channel_id`.
2. Calls the YouTube service to fetch and transform video data.
3. For each video, checks whether a matching content record already exists (by `external_content_id`).
   - **Exists** → update the existing record's metrics.
   - **Does not exist** → create a new content record.
4. Commits all changes to PostgreSQL in a single transaction (rolled back on failure).
5. Returns a summary: `records_synced`, `records_created`, `records_updated`, `records_skipped`.

This prevents duplicate content records when synchronization is run more than once.

---

## Testing Procedure

1. **Swagger UI** (`/docs`): used to manually test every endpoint listed above, including valid and invalid inputs (e.g., invalid `content_id`, invalid `channel_id`, missing required fields).
2. **pgAdmin**: after each write operation (content CRUD, audience/growth CRUD, YouTube sync), the corresponding table was inspected directly in pgAdmin to confirm the data was correctly persisted.
3. **End-to-end verification**: after running `POST /social/youtube/sync`, the existing analytics endpoints (`/analytics/summary`, `/analytics/top-content`, `/analytics/platform-comparison`, `/analytics/chart/engagement`, `/analytics/chart/followers`) were re-tested to confirm they correctly include the newly synchronized YouTube data without any YouTube-specific analytics logic.

---

## 🛠️ Tech Stack

* **Backend:** Python 3.10+, FastAPI, SQLAlchemy, Pydantic, Alembic, Celery, Redis
* **Frontend:** JavaScript, React.js, Tailwind CSS, Chart.js / Recharts, Axios
* **Database:** PostgreSQL (Primary), MongoDB (Secondary), Redis (Cache)
* **Authentication:** JWT, OAuth2
* **Integrations:** YouTube Data API, Instagram Graph API, TikTok API, Facebook Graph API, LinkedIn API

---

## 📂 Project Structure

```text
├── backend/
│   ├── app/
│   │   ├── api/            # API endpoints/routers (auth, users, content, analytics, social)
│   │   ├── core/           # Configuration, security, JWT helpers
│   │   ├── db/             # Database session setup and Base models
│   │   ├── models/         # SQLAlchemy ORM models
│   │   ├── schemas/        # Pydantic validation models
│   │   ├── services/       # Business logic and external API integrations
│   │   └── main.py         # FastAPI application entry point
│   ├── alembic/            # Database migrations
│   ├── Dockerfile
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── components/     # UI components & Recharts visualizations
│   │   ├── pages/          # Dashboard views (Analytics, Audience, Revenue)
│   │   ├── services/       # Axios API client routines
│   │   └── App.js
│   ├── Dockerfile
│   └── package.json
├── docker-compose.yml
└── README.md

```

---

## ⚙️ Getting Started

### Prerequisites

* [Docker](https://www.docker.com/) & [Docker Compose](https://docs.docker.com/compose/) installed
* Python 3.10+ (for local backend development)
* Node.js 18+ (for local frontend development)

### Running with Docker

1. **Clone the repository:**
```bash
git clone [https://github.com/springboardmentor330h/Creator-Analytics-Content-Performance-Dashboard.git](https://github.com/springboardmentor330h/Creator-Analytics-Content-Performance-Dashboard.git)
cd Creator-Analytics-Content-Performance-Dashboard

```


2. **Set up Environment Variables:**
Create a `.env` file in the root directory based on `.env.example`:
```env
DATABASE_URL=postgresql://user:password@db:5432/creatoriq_db
SECRET_KEY=your_jwt_secret_key
YOUTUBE_API_KEY=your_youtube_api_key

```


3. **Start services:**
```bash
docker-compose up --build

```


* **Frontend:** `http://localhost:3000`
* **Backend API Docs (Swagger):** `http://localhost:8000/docs`



---

## 🗓️ Development Roadmap

* [x] **Milestone 1:** Architecture Design, Project Setup, JWT Auth & Base Dashboard UI
* [x] **Milestone 2:** Content Analytics Module & YouTube API Data Sync Integration
* [ ] **Milestone 3:** Revenue Analytics, Notification Engine & Export Module (PDF/Excel)
* [ ] **Milestone 4:** Full Cloud Deployment (AWS/Azure), Dockerization & Performance Optimization


## Author

Harsh Kumar — CreatorIQ Project
