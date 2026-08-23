# CreatorIQ – Creator Analytics & Content Performance Dashboard

## Project Overview

CreatorIQ is a backend analytics platform that helps content creators understand how their content performs across multiple social media platforms. It stores content performance data (views, likes, comments, shares, saves, watch time, reach), calculates engagement metrics, tracks audience demographics and follower growth, and synchronizes real analytics data from YouTube.

The API is built with **FastAPI** and **PostgreSQL**, following a layered architecture that separates routing, business logic, and data access.

---

## System Architecture

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

For real platform integration (YouTube):

```
YouTube Data API
      │
      ▼
youtube_service.py  (fetch + transform)
      │
      ▼
Common CreatorIQ Data Format
      │
      ▼
POST /social/youtube/sync  (validate + create/update)
      │
      ▼
PostgreSQL (content table)
      │
      ▼
Analytics Service  (reads from the same content table)
      │
      ▼
Analytics APIs → Dashboard
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

## YouTube API Integration

`app/services/youtube_service.py` integrates with the real **YouTube Data API v3**:

1. Calls the `search` endpoint to retrieve the latest video IDs for a given channel.
2. Calls the `videos` endpoint to retrieve statistics (views, likes, comments) and snippet data (title, published date) for those videos.
3. Transforms the raw API response into CreatorIQ's common content format.

**Credential management:** the YouTube API key is loaded from the `YOUTUBE_API_KEY` environment variable via `app/core/config.py` (using `pydantic-settings`), and is never hardcoded. The `.env` file is excluded from version control via `.gitignore`.

**Error handling** covers: missing/invalid API key, missing/invalid channel ID, network failures, non-200 API responses (including quota/rate-limit errors), invalid JSON, and empty result sets.

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

## Tech Stack

- **Framework:** FastAPI
- **Database:** PostgreSQL
- **ORM:** SQLAlchemy
- **Validation:** Pydantic
- **Authentication:** JWT (python-jose) + password hashing
- **External API:** YouTube Data API v3

---