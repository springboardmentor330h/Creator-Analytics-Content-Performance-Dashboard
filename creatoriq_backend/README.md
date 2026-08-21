# CreatorIQ – Real YouTube API Integration, Revenue Analytics & Sponsorship Tracking (Sprint 6)

CreatorIQ is an enterprise-grade creator analytics and multi-platform content performance management platform built with FastAPI, PostgreSQL, SQLAlchemy, and OAuth / Social Data Integrations.

---

## 1. Project Overview

CreatorIQ provides multi-tenant and role-based performance analytics for digital content creators, marketing teams, agencies, and administrators. Sprint 6 extends the platform to support comprehensive **Revenue Analytics and Sponsorship Campaign Tracking**, enabling creators to track diversified monetization streams, manage brand partnerships, monitor contract deliverables/payment statuses, and visualize monthly revenue trends with strict creator data isolation.

---

## 2. System Architecture

```
                                  +-----------------------------+
                                  |     YouTube Data API v3     |
                                  +--------------+--------------+
                                                 |
                                                 v
                                  +-----------------------------+
                                  |    app/services/            |
                                  |    youtube_service.py       |
                                  +--------------+--------------+
                                                 |
                                                 v
                                  +-----------------------------+
                                  |     Data Transformation     |
                                  |  (CreatorIQ Common Format)  |
                                  +--------------+--------------+
                                                 |
                                                 v
                                  +-----------------------------+
                                  |       Data Validation       |
                                  +--------------+--------------+
                                                 |
                                                 v
                                  +-----------------------------+
                                  |     Duplicate Detection     |
                                  | (platform + ext_content_id) |
                                  +--------------+--------------+
                                                 |
                                                 v
                                  +-----------------------------+
                                  |      PostgreSQL Database    |
                                  | (content, revenue, sponsor) |
                                  +--------------+--------------+
                                                 |
                                                 v
                                  +-----------------------------+
                                  |    app/services/            |
                                  | revenue & analytics services|
                                  +--------------+--------------+
                                                 |
                                                 v
                                  +-----------------------------+
                                  |     FastAPI Analytics APIs  |
                                  +--------------+--------------+
                                                 |
                                                 v
                                  +-----------------------------+
                                  |      Creator Dashboard      |
                                  +-----------------------------+
```

---

## 3. Modules Implemented

- **Core & Config (`app/core/config.py`)**: Centralized Pydantic settings loading environment variables including `YOUTUBE_API_KEY`, `YOUTUBE_CLIENT_ID`, `YOUTUBE_CLIENT_SECRET`, database URL, and JWT settings.
- **Data Models (`app/models/`)**:
  - `Content` (`app/models/content.py`): Platform-native and synced content metadata.
  - `Revenue` (`app/models/revenue.py`): Multi-channel earnings tracking with categorization.
  - `Sponsorship` (`app/models/sponsorship.py`): Brand deals, campaign deliverables, and payment tracking.
- **Data Schemas (`app/schemas/`)**: Pydantic v2 validation models for requests and responses.
- **Services (`app/services/`)**:
  - `youtube_service.py`: YouTube API v3 synchronization and idempotent ingestion.
  - `revenue_service.py`: Revenue CRUD, breakdown by source, monthly revenue, and trends.
  - `sponsorship_service.py`: Sponsorship CRUD, campaign summaries, and status tracking.
  - `analytics_service.py`: Cross-platform engagement, summary metrics, and follower curves.
- **Routers (`app/routers/`)**: RESTful API endpoints for auth, content, social sync, revenue, sponsorships, and analytics.

---

## 4. API Endpoints

### Authentication & Users
- `POST /auth/register` – Register a new user (Creator, Agency, Marketing Team, Administrator).
- `POST /auth/login` – Authenticate user and receive JWT access token.
- `GET /users/me` – Retrieve current user profile.

### Social & YouTube Integration (Sprint 5)
- `POST /social/youtube/sync` – Synchronize YouTube videos and metrics into PostgreSQL.
- `POST /social/connect` – Connect a social media platform account.
- `GET /social/platforms` – List connected social platforms.
- `POST /social/sync` – Synchronize simulated social platform data.

### Revenue Management & Analytics (Sprint 6)
- `POST /revenue` – Add a new revenue record (`Sponsorship`, `Ad Revenue`, `Affiliate Marketing`, `Brand Collaboration`, `Subscription Revenue`).
- `GET /revenue` – List all revenue records for authenticated creator.
- `GET /revenue/{id}` – Retrieve single revenue record.
- `PUT /revenue/{id}` – Update single revenue record.
- `DELETE /revenue/{id}` – Delete single revenue record.
- `GET /analytics/revenue/summary` – Retrieve total accumulated revenue and currency.
- `GET /analytics/revenue/by-source` – Retrieve revenue breakdown grouped by category.
- `GET /analytics/revenue/monthly` – Retrieve chronological monthly revenue totals.
- `GET /analytics/revenue/trend` – Retrieve chart-ready monthly revenue time-series labels and values.

### Sponsorship Management & Tracking (Sprint 6)
- `POST /sponsorships` – Create a new brand sponsorship campaign (`Draft`, `Active`, `Completed`, `Cancelled`).
- `GET /sponsorships` – List all sponsorship campaigns for authenticated creator.
- `GET /sponsorships/{id}` – Retrieve single sponsorship campaign details.
- `PUT /sponsorships/{id}` – Update sponsorship campaign details.
- `DELETE /sponsorships/{id}` – Delete sponsorship campaign.
- `GET /analytics/sponsorships/summary` – Summary of total deals, contract value, active deals, and pending payments.
- `GET /analytics/sponsorships/status` – Breakdown of sponsorship deals grouped by status.

### Performance Analytics Endpoints
- `GET /analytics/summary` – Aggregate KPI totals (views, likes, comments, shares, reach, followers, avg engagement rate).
- `GET /analytics/top-content` – Top performing content ranked by engagement rate.
- `GET /analytics/platform-comparison` – Cross-platform performance comparison (YouTube, Instagram, TikTok, LinkedIn, etc.).
- `GET /analytics/chart/engagement` – Chronological engagement rate timeline data.
- `GET /analytics/chart/followers` – Chronological follower growth timeline data.
- `GET /analytics/content/{id}/engagement` – Detailed metrics for a single content item.

---

## 5. Database Tables

### `public.content`
Stores normalized content across all social media platforms.

### `public.revenue`
Stores creator revenue records across diversified monetization channels:

| Column | Type | Constraints / Description |
| :--- | :--- | :--- |
| `id` | Integer | Primary key, Auto-increment |
| `creator_id` | Integer | Foreign key to `users.id` (CASCADE), Indexed |
| `source` | String(100) | 'Sponsorship', 'Ad Revenue', 'Affiliate Marketing', 'Brand Collaboration', 'Subscription Revenue' |
| `amount` | Float | Revenue amount (>= 0.0) |
| `currency` | String(10) | Currency code (default: 'INR') |
| `description` | Text | Optional campaign / invoice notes |
| `revenue_date` | Date | Transaction / earnings date |
| `created_at` | DateTime | Creation timestamp (UTC) |
| `updated_at` | DateTime | Last updated timestamp (UTC) |

### `public.sponsorship`
Tracks creator brand partnerships, campaigns, and contract payment status:

| Column | Type | Constraints / Description |
| :--- | :--- | :--- |
| `id` | Integer | Primary key, Auto-increment |
| `creator_id` | Integer | Foreign key to `users.id` (CASCADE), Indexed |
| `brand_name` | String(150) | Brand / sponsor company name |
| `campaign_name` | String(150) | Campaign title / deliverables |
| `contract_value` | Float | Agreed contract value (>= 0.0) |
| `currency` | String(10) | Currency code (default: 'INR') |
| `start_date` | Date | Campaign start date |
| `end_date` | Date | Campaign end date (>= start_date) |
| `status` | String(50) | 'Draft', 'Active', 'Completed', 'Cancelled' |
| `payment_status` | String(50) | 'Pending', 'Partially Paid', 'Paid', 'Overdue' |
| `description` | Text | Campaign terms and scope |
| `created_at` | DateTime | Creation timestamp (UTC) |
| `updated_at` | DateTime | Last updated timestamp (UTC) |

---

## 6. PostgreSQL Verification

Run the following queries in **pgAdmin** or `psql` to verify synchronized records and duplicate handling:

```sql
-- 1. View all synchronized content
SELECT * FROM public.content ORDER BY id DESC;

-- 2. Verify Revenue records (Sprint 6)
SELECT id, creator_id, source, amount, currency, revenue_date, created_at
FROM public.revenue
ORDER BY id DESC;

-- 3. Verify Sponsorship campaigns (Sprint 6)
SELECT id, creator_id, brand_name, campaign_name, contract_value, currency, status, payment_status, start_date, end_date
FROM public.sponsorship
ORDER BY id DESC;
```

---

## How to Run Tests

To execute the automated test suite:

```bash
pytest -v
```

To run Sprint 6 Revenue & Sponsorship tests specifically:

```bash
pytest tests/test_sprint6.py -v
```
