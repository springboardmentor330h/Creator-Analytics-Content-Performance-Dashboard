

  # Creator Analytics & Content Performance Dashboard

  A FastAPI-based backend for managing creator content and generating analytics such as engagement rate, top-performing content, platform performance, and dashboard summaries.

  ---

  ## 1. Tech Stack

  * Python 3.9+
  * FastAPI
  * PostgreSQL
  * SQLAlchemy
  * Pydantic
  * Swagger / OpenAPI
  * pgAdmin
  * Uvicorn

  ---

  ## 2. Run the Backend

  From the project root:

  ```bash
  py -3.9 -m uvicorn backend.app.main:app --reload
  ```

  Backend:

  ```text
  http://127.0.0.1:8000
  ```

  Swagger:

  ```text
  http://127.0.0.1:8000/docs
  ```

  ReDoc:

  ```text
  http://127.0.0.1:8000/redoc
  ```

  ---

  # 3. API Overview

  | #  | Method | Endpoint                             | Purpose                    |
  | -- | ------ | ------------------------------------ | -------------------------- |
  | 1  | POST   | `/auth/register`                     | Register a user            |
  | 2  | POST   | `/auth/login`                        | Login                      |
  | 3  | GET    | `/content`                           | Get all content            |
  | 4  | POST   | `/content`                           | Create content             |
  | 5  | GET    | `/content/{id}`                      | Get content by ID          |
  | 6  | PUT    | `/content/{id}`                      | Update content             |
  | 7  | DELETE | `/content/{id}`                      | Delete content             |
  | 8  | GET    | `/analytics/content/{id}/engagement` | Calculate engagement       |
  | 9  | GET    | `/analytics/top-content`             | Get top-performing content |
  | 10 | GET    | `/analytics/platform-performance`    | Compare platforms          |
  | 11 | GET    | `/analytics/summary`                 | Dashboard summary          |
  | 12 | POST   | `/audience`                          | Create audience record     |
  | 13 | GET    | `/audience`                          | Get all audience records   |
  | 14 | GET    | `/audience/{id}`                     | Get audience record by ID  |
  | 15 | PUT    | `/audience/{id}`                     | Update audience record     |
  | 16 | DELETE | `/audience/{id}`                     | Delete audience record     |
  | 17 | GET    | `/analytics/audience`                | Audience analytics report  |
  | 18 | GET    | `/analytics/growth`                  | Growth analytics report    |
  | 19 | GET    | `/analytics/audience-trends`         | Audience trends chart data |
  | 20 | POST   | `/revenue`                           | Create revenue entry       |
  | 21 | GET    | `/revenue`                           | Get creator revenue list   |
  | 22 | GET    | `/revenue/{id}`                      | Get revenue entry by ID    |
  | 23 | PUT    | `/revenue/{id}`                      | Update revenue entry       |
  | 24 | DELETE | `/revenue/{id}`                      | Delete revenue entry       |
  | 25 | GET    | `/revenue/analytics/summary`         | Revenue summary overview   |
  | 26 | GET    | `/revenue/analytics/by-source`       | Earnings breakdown by stream|
  | 27 | GET    | `/revenue/analytics/monthly`         | Monthly revenue analytics  |
  | 28 | GET    | `/revenue/analytics/trends`          | Revenue trend data points  |
  | 29 | POST   | `/sponsorships`                      | Create sponsorship deal    |
  | 30 | GET    | `/sponsorships`                      | List sponsorship deals     |
  | 31 | GET    | `/sponsorships/{id}`                 | Get sponsorship by ID      |
  | 32 | PUT    | `/sponsorships/{id}`                 | Update sponsorship deal    |
  | 33 | DELETE | `/sponsorships/{id}`                 | Delete sponsorship deal    |


  # 4. Authentication APIs

  ## 4.1 Register User

  ### Request

  ```http
  POST /auth/register
  ```

  ### Body

  ```json
  {
    "username": "revanth",
    "email": "revanth@example.com",
    "password": "Password123"
  }
  ```

  ### Expected Response

  ```http
  201 Created
  ```

  ```json
  {
    "id": 1,
    "username": "revanth",
    "email": "revanth@example.com"
  }
  ```

  ---

  # 5. Login

  ## POST `/auth/login`

  Authenticates a user and returns an authentication token if JWT authentication is implemented.

  ### Request

  ```http
  POST /auth/login
  ```

  ### Body

  ```json
  {
    "username": "revanth",
    "password": "Password123"
  }
  ```

  ### Expected Response

  ```http
  200 OK
  ```

  Example:

  ```json
  {
    "access_token": "eyJhbGciOiJIUzI1NiIs...",
    "token_type": "bearer"
  }
  ```

  If your API uses OAuth2 form login instead of JSON, Swagger may show:

  ```text
  username
  password
  ```

  as form fields instead.

  ---

  # 6. Content APIs

  Content APIs manage creator content and performance metrics.

  ## Content Object

  A typical content object contains:

  ```json
  {
    "creator_id": 1,
    "platform": "YouTube",
    "content_title": "They Call Him OG - Firestorm Lyric Video",
    "views": 74484217,
    "likes": 1219934,
    "comments": 46679,
    "shares": 0,
    "saves": 0,
    "watch_time": 0,
    "reach": 74484217,
    "published_date": "2025-08-02"
  }
  ```

  ---

  # 7. Create Content

  ## POST `/content`

  Creates a single content record.

  ### Request Body

  ```json
  {
    "creator_id": 1,
    "platform": "YouTube",
    "content_title": "They Call Him OG - Firestorm Lyric Video",
    "views": 74484217,
    "likes": 1219934,
    "comments": 46679,
    "shares": 0,
    "saves": 0,
    "watch_time": 0,
    "reach": 74484217,
    "published_date": "2025-08-02"
  }
  ```

  ### Success

  ```http
  201 Created
  ```

  ### Response

  ```json
  {
    "id": 1,
    "creator_id": 1,
    "platform": "YouTube",
    "content_title": "They Call Him OG - Firestorm Lyric Video",
    "views": 74484217,
    "likes": 1219934,
    "comments": 46679,
    "shares": 0,
    "saves": 0,
    "watch_time": 0,
    "reach": 74484217,
    "published_date": "2025-08-02"
  }
  ```

  ---

  # 8. Create Multiple Content Records

  If a bulk endpoint has been implemented:

  ## POST `/content/bulk`

  Creates multiple content records in one request.

  ### Request Body

  ```json
  [
    {
      "creator_id": 1,
      "platform": "YouTube",
      "content_title": "They Call Him OG - Firestorm",
      "views": 74484217,
      "likes": 1219934,
      "comments": 46679,
      "shares": 0,
      "saves": 0,
      "watch_time": 0,
      "reach": 74484217,
      "published_date": "2025-08-02"
    },
    {
      "creator_id": 1,
      "platform": "YouTube",
      "content_title": "They Call Him OG - Streets of Fire",
      "views": 3077384,
      "likes": 60560,
      "comments": 979,
      "shares": 0,
      "saves": 0,
      "watch_time": 0,
      "reach": 3077384,
      "published_date": "2025-09-01"
    }
  ]
  ```

  ### Success

  ```http
  201 Created
  ```

  ### Response

  ```json
  [
    {
      "id": 1,
      "content_title": "They Call Him OG - Firestorm"
    },
    {
      "id": 2,
      "content_title": "They Call Him OG - Streets of Fire"
    }
  ]
  ```

  > If `/content/bulk` is not implemented, use `POST /content` one record at a time.

  ---

  # 9. Get All Content

  ## GET `/content`

  Returns all content records.

  ### Request

  ```http
  GET /content
  ```

  ### Success

  ```http
  200 OK
  ```

  ### Response

  ```json
  [
    {
      "id": 1,
      "creator_id": 1,
      "platform": "YouTube",
      "content_title": "They Call Him OG - Firestorm",
      "views": 74484217,
      "likes": 1219934,
      "comments": 46679,
      "shares": 0,
      "saves": 0,
      "watch_time": 0,
      "reach": 74484217,
      "published_date": "2025-08-02"
    }
  ]
  ```

  ---

  # 10. Get Content by ID

  ## GET `/content/{id}`

  Returns one content record.

  ### Example

  ```http
  GET /content/1
  ```

  ### Success

  ```http
  200 OK
  ```

  ### Response

  ```json
  {
    "id": 1,
    "creator_id": 1,
    "platform": "YouTube",
    "content_title": "They Call Him OG - Firestorm",
    "views": 74484217,
    "likes": 1219934,
    "comments": 46679,
    "shares": 0,
    "saves": 0,
    "watch_time": 0,
    "reach": 74484217,
    "published_date": "2025-08-02"
  }
  ```

  ### Not Found

  ```http
  404 Not Found
  ```

  ```json
  {
    "detail": "Content not found"
  }
  ```

  ---

  # 11. Update Content

  ## PUT `/content/{id}`

  Updates an existing content record.

  ### Example

  ```http
  PUT /content/1
  ```

  ### Request Body

  ```json
  {
    "content_title": "They Call Him OG - Firestorm Lyric Video",
    "views": 75000000,
    "likes": 1220000
  }
  ```

  ### Success

  ```http
  200 OK
  ```

  ### Response

  ```json
  {
    "id": 1,
    "content_title": "They Call Him OG - Firestorm Lyric Video",
    "views": 75000000,
    "likes": 1220000
  }
  ```

  ### Not Found

  ```http
  404 Not Found
  ```

  ---

  # 12. Delete Content

  ## DELETE `/content/{id}`

  Deletes a content record.

  ### Example

  ```http
  DELETE /content/1
  ```

  ### Success

  ```http
  200 OK
  ```

  ### Response

  ```json
  {
    "message": "Content deleted successfully"
  }
  ```

  ### Not Found

  ```http
  404 Not Found
  ```

  ```json
  {
    "detail": "Content not found"
  }
  ```

  ---

  # 13. Validation

  The Content API validates incoming data.

  ## Short Content Title

  A title shorter than 3 characters should fail.

  ### Example

  ```json
  {
    "creator_id": 1,
    "platform": "YouTube",
    "content_title": "OG",
    "views": 1000,
    "likes": 100,
    "comments": 20,
    "shares": 10,
    "saves": 5,
    "watch_time": 500,
    "reach": 1500,
    "published_date": "2025-08-02"
  }
  ```

  Expected:

  ```http
  422 Unprocessable Entity
  ```

  ## Negative Metrics

  Example:

  ```json
  {
    "views": -100
  }
  ```

  Expected:

  ```http
  422 Unprocessable Entity
  ```

  ---

  # 14. Analytics APIs

  Analytics APIs calculate performance metrics from the `contents` table.

  ---

  # 15. Content Engagement

  ## GET `/analytics/content/{id}/engagement`

  Calculates engagement for a specific content item.

  ### Example

  ```http
  GET /analytics/content/1/engagement
  ```

  ### Formula

  ```text
  Total Engagement =
  Likes + Comments + Shares + Saves
  ```

  ```text
  Engagement Rate =
  (Total Engagement / Reach) × 100
  ```

  ### Success

  ```http
  200 OK
  ```

  ### Response

  ```json
  {
    "content_id": 1,
    "platform": "YouTube",
    "views": 74484217,
    "reach": 74484217,
    "total_engagement": 1306613,
    "engagement_rate": 1.75
  }
  ```

  ### Not Found

  ```http
  404 Not Found
  ```

  ```json
  {
    "detail": "Content not found"
  }
  ```

  ---

  # 16. Top Performing Content

  ## GET `/analytics/top-content`

  Returns content sorted by engagement rate.

  ### Default

  ```http
  GET /analytics/top-content
  ```

  Default limit:

  ```text
  5
  ```

  ### Custom Limit

  ```http
  GET /analytics/top-content?limit=10
  ```

  ### Response

  ```json
  [
    {
      "content_id": 1,
      "content_title": "They Call Him OG - Firestorm",
      "platform": "YouTube",
      "views": 74484217,
      "reach": 74484217,
      "watch_time": 0,
      "engagement_rate": 1.75
    },
    {
      "content_id": 2,
      "content_title": "They Call Him OG - Streets of Fire",
      "platform": "YouTube",
      "views": 3077384,
      "reach": 3077384,
      "watch_time": 0,
      "engagement_rate": 2.05
    }
  ]
  ```

  ---

  # 17. Platform Performance

  ## GET `/analytics/platform-performance`

  Returns aggregated performance by platform.

  ### Request

  ```http
  GET /analytics/platform-performance
  ```

  ### Response

  ```json
  [
    {
      "platform": "YouTube",
      "total_views": 85000000,
      "total_likes": 1400000,
      "total_comments": 50000,
      "total_reach": 90000000,
      "average_engagement_rate": 2.15
    }
  ]
  ```

  If Instagram, LinkedIn, or other platform records exist, they will appear as separate entries.

  ---

  # 18. Dashboard Summary

  ## GET `/analytics/summary`

  Returns the main dashboard-level statistics.

  ### Request

  ```http
  GET /analytics/summary
  ```

  ### Response

  ```json
  {
    "total_content": 10,
    "total_views": 85000000,
    "total_reach": 90000000,
    "average_engagement_rate": 2.15,
    "best_platform": "YouTube",
    "top_content": "They Call Him OG - Firestorm"
  }
  ```

  ---

  # 19. Audience Analytics & Growth Trends APIs (Sprint 3)

  The Audience Analytics Engine provides demographic data, growth trends, and audience behavior insights.

  ## 19.1 Create Audience Record

  ### Request

  ```http
  POST /audience
  ```

  ```json
  {
    "creator_id": 1,
    "age_group": "18-24",
    "gender": "Female",
    "country": "India",
    "city": "Bangalore",
    "device_type": "Mobile",
    "active_hour": 18,
    "followers": 125000,
    "impressions": 720000,
    "reach": 450000
  }
  ```

  ### Response

  ```http
  201 Created
  ```

  ```json
  {
    "id": 1,
    "creator_id": 1,
    "age_group": "18-24",
    "gender": "Female",
    "country": "India",
    "city": "Bangalore",
    "device_type": "Mobile",
    "active_hour": 18,
    "followers": 125000,
    "impressions": 720000,
    "reach": 450000
  }
  ```

  ---

  ## 19.2 Get All Audience Records

  ### Request

  ```http
  GET /audience
  ```

  ---

  ## 19.3 Get Audience Record by ID

  ### Request

  ```http
  GET /audience/{id}
  ```

  ---

  ## 19.4 Update Audience Record

  ### Request

  ```http
  PUT /audience/{id}
  ```

  ```json
  {
    "followers": 130000,
    "reach": 470000
  }
  ```

  ---

  ## 19.5 Delete Audience Record

  ### Request

  ```http
  DELETE /audience/{id}
  ```

  ---

  ## 19.6 Audience Analytics Report

  ### Request

  ```http
  GET /analytics/audience
  ```

  ### Example Response

  ```json
  {
    "total_followers": 125000,
    "total_reach": 450000,
    "total_impressions": 720000,
    "gender_distribution": {
      "male": 58,
      "female": 42
    },
    "age_distribution": {
      "18-24": 55.0,
      "25-34": 45.0
    },
    "top_country": "India",
    "top_city": "Bangalore",
    "top_device": "Mobile"
  }
  ```

  ---

  ## 19.7 Growth Analytics Report

  ### Request

  ```http
  GET /analytics/growth
  ```

  ### Example Response

  ```json
  [
    {
      "date": "2026-08-01",
      "followers": 120000,
      "daily_growth": 0,
      "growth_percentage": 0.0
    },
    {
      "date": "2026-08-02",
      "followers": 120850,
      "daily_growth": 850,
      "growth_percentage": 0.71
    }
  ]
  ```

  ---

  ## 19.8 Audience Trends API

  ### Request

  ```http
  GET /analytics/audience-trends
  ```

  ### Example Response

  ```json
  [
    {
      "date": "2026-08-01",
      "followers": 120000,
      "reach": 15000
    },
    {
      "date": "2026-08-02",
      "followers": 120850,
      "reach": 16200
    }
  ]
  ```

  ---

  # 20. HTTP Status Codes

  | Status | Meaning                        |
  | ------ | ------------------------------ |
  | `200`  | Successful request             |
  | `201`  | Resource successfully created  |
  | `400`  | Bad request                    |
  | `401`  | Authentication required/failed |
  | `403`  | Access forbidden               |
  | `404`  | Resource not found             |
  | `422`  | Validation error               |
  | `500`  | Internal server error          |

  ---

  # 21. Database

  PostgreSQL is used as the application's database.

  Tables under public schema:

  1. `users`
  2. `contents`
  3. `audience` (stores audience demographics & behavior)
  4. `growth` (stores daily historical analytics data)

  ---

  # 22. Verify Data in pgAdmin

  Open pgAdmin:

  ```text
  Servers
    → PostgreSQL
      → Databases
        → creatoriq
          → Schemas
            → public
              → Tables
                → users
                → contents
                → audience
                → growth
  ```

  Run verification queries:

  ```sql
  SELECT * FROM users;
  SELECT * FROM contents;
  SELECT * FROM audience;
  SELECT * FROM growth;
  ```

  Run:

  ```sql
  SELECT * FROM contents;
  ```

  To see the latest records:

  ```sql
  SELECT *
  FROM contents
  ORDER BY id DESC;
  ```

  ---

  # 22. API Testing Flow

  Recommended testing order:

  ```text
  1. Register
        ↓
  2. Login
        ↓
  3. Create Content
        ↓
  4. Get All Content
        ↓
  5. Get Content By ID
        ↓
  6. Update Content
        ↓
  7. Verify Database
        ↓
  8. Engagement Analytics
        ↓
  9. Top Content
        ↓
  10. Platform Performance
        ↓
  11. Dashboard Summary
        ↓
  12. Delete Content
  ```

  ---

  # 23. Swagger Testing

  Open:

  ```text
  http://127.0.0.1:8000/docs
  ```

  For every endpoint:

  1. Expand the endpoint.
  2. Click **Try it out**.
  3. Enter the required parameters/body.
  4. Click **Execute**.
  5. Verify the HTTP status code.
  6. Verify the response JSON.

  ---

  # 24. Automated Tests

  Run the test suite:

  ```bash
  # Run all tests
  $env:PYTHONPATH="."; py -m unittest discover backend/tests

  # Run revenue & sponsorship tests specifically
  $env:PYTHONPATH="."; py -m unittest backend/tests/test_revenue.py

  # Run audience & growth tests specifically
  $env:PYTHONPATH="."; py -m unittest backend/tests/test_audience.py

  # Run content analytics tests specifically
  $env:PYTHONPATH="."; py -m unittest backend/tests/test_analytics.py
  ```

  The test suite verifies:

  * Revenue & Sponsorship CRUD operations
  * Total revenue, source-wise, monthly, and trend calculations
  * Multi-tenancy access control (creator-level data isolation)
  * Audience CRUD endpoints
  * Growth & Audience Analytics reports
  * Pydantic validation (negative values, active_hour bounds 0-23)
  * Content engagement calculations
  * Top content & platform performance
  * Database schema creation & query operations

  ---

  # 25. Sprint 5: YouTube API Integration & Multi-Platform Synchronization Engine

Sprint 5 implements real YouTube API integration, common data transformation, credential management, duplicate handling, and multi-platform synchronization into PostgreSQL.

## 25.1 Data Flow Architecture

```text
YouTube API v3
     ↓
YouTube Service (youtube_service.py)
     ↓
Data Transformation (CreatorIQ Common Data Format)
     ↓
Duplicate Check (platform + external_content_id)
     ↓
PostgreSQL (contents table)
     ↓
Analytics Service (analytics_service.py)
     ↓
FastAPI APIs (/analytics/summary, /analytics/top-content)
     ↓
Dashboard UI
```

## 25.2 API Credential Management

API credentials are securely managed via environment variables and NEVER hard-coded:
- File: `.env` (Ignored in `.gitignore`)
- Variable: `YOUTUBE_API_KEY=your_key_here`

## 25.3 Common CreatorIQ Data Format

To support multi-platform analytics across YouTube, Instagram, TikTok, LinkedIn, Twitter/X, and Facebook, all platform payloads are transformed into a standard internal format:

```json
{
  "creator_id": 1,
  "platform": "YouTube",
  "external_content_id": "yt_video_008",
  "content_title": "Pawan Kalyan Powerful Speech",
  "views": 850000,
  "likes": 42000,
  "comments": 3800,
  "shares": 38250,
  "reach": 1377000,
  "published_date": "2026-07-15"
}
```

## 25.4 YouTube Synchronization API

### Endpoint

```http
POST /social/youtube/sync
```

### Request Parameters

- `channel_id` (optional, string): YouTube Channel ID or handle.
- `creator_id` (optional, int): Creator ID (default: `1`).

### Example Response

```json
{
  "platform": "YouTube",
  "status": "success",
  "records_synced": 8,
  "message": "Successfully synchronized 8 YouTube videos into PostgreSQL database."
}
```

## 25.5 Duplicate Synchronization Handling

- When synchronization runs multiple times, the engine checks for existing records by matching `(platform + external_content_id)` or `(platform + content_title)`.
- **If existing**: Updates views, likes, comments, shares, reach, and published date in PostgreSQL.
- **If new**: Inserts a new content record into PostgreSQL.

  ---

  # 26. Project Architecture

  ```text
  Creator-Analytics-Content-Performance-Dashboard
  │
  ├── backend/
  │   ├── alembic/
  │   │   ├── versions/
  │   │   │   └── 95b43d6077c7_create_revenue_and_sponsorship_tables.py
  │   │   └── env.py
  │   ├── alembic.ini
  │   ├── app/
  │   │   ├── main.py
  │   │   ├── core/
  │   │   │   ├── auth.py
  │   │   │   ├── deps.py
  │   │   │   ├── jwt.py
  │   │   │   └── security.py
  │   │   ├── db/
  │   │   │   └── database.py
  │   │   ├── models/
  │   │   │   ├── user.py
  │   │   │   ├── content.py
  │   │   │   ├── audience.py
  │   │   │   ├── growth.py
  │   │   │   ├── revenue.py
  │   │   │   └── sponsorship.py
  │   │   ├── schemas/
  │   │   │   ├── revenue.py
  │   │   │   └── sponsorship.py
  │   │   ├── routers/
  │   │   │   ├── revenue.py
  │   │   │   └── sponsorships.py
  │   │   └── services/
  │   │       ├── revenue_service.py
  │   │       └── sponsorship_service.py
  │   │
  │   └── tests/
  │       ├── test_analytics.py
  │       ├── test_audience.py
  │       ├── test_users.py
  │       └── test_revenue.py
  │
  ├── frontend/
  │   ├── src/
  │   │   ├── api.js
  │   │   ├── App.jsx
  │   │   ├── components/
  │   │   │   ├── RevenueModal.jsx
  │   │   │   └── SponsorshipModal.jsx
  │   │   └── pages/
  │   │       └── RevenueView.jsx
  │
  ├── .env
  ├── .gitignore
  ├── requirements.txt
  └── README.md
  ```

  ---

  # 27. End-to-End Data Flow

  ```text
  Creator Login
       ↓
  Revenue / Sponsorship Entry
       ↓
  PostgreSQL (revenues & sponsorships tables)
       ↓
  Revenue Analytics Service
       ↓
  FastAPI Endpoints (/revenue/analytics/summary, /by-source, /monthly, /trends)
       ↓
  Dashboard-Ready UI (Revenue & Sponsorship Hub)
  ```

  ---

  # 28. Sprint 6: Revenue Analytics & Sponsorship Tracking (Milestone 3)

  Sprint 6 introduces financial management, brand sponsorship tracking, source-wise revenue analytics, and monthly earnings visualization for CreatorIQ.

  ## 28.1 Revenue Management

  Creators can log and manage revenue streams across:
  - **Sponsorships**: Brand integrations and paid campaign contracts
  - **Ad Revenue**: Platform ad monetization (YouTube AdSense, Meta Bonus, etc.)
  - **Affiliate Marketing**: Commission earnings and referral links
  - **Brand Collaborations**: Joint product launches and promo deals
  - **Subscription Revenue**: Channel memberships, Patreon, and monthly fans

  ### Revenue APIs
  - `POST /revenue`: Create a new revenue entry
  - `GET /revenue`: List all revenue records for authenticated creator (supports `?source=...` filter)
  - `GET /revenue/{id}`: Get single revenue record
  - `PUT /revenue/{id}`: Update revenue record
  - `DELETE /revenue/{id}`: Delete revenue record

  ## 28.2 Sponsorship Management

  Tracks detailed brand partnership contracts:
  - Brand name, campaign title, agreed contract value ($)
  - Start date & end date
  - Deal status: `Active`, `Pending`, `Completed`, `Cancelled`
  - Payment status: `Unpaid`, `Paid`, `Pending`, `Processing`

  ### Sponsorship APIs
  - `POST /sponsorships`: Create a sponsorship contract
  - `GET /sponsorships`: List creator's sponsorships (supports `?status=...` and `?payment_status=...` filters)
  - `GET /sponsorships/{id}`: Get sponsorship details
  - `PUT /sponsorships/{id}`: Update sponsorship contract
  - `DELETE /sponsorships/{id}`: Delete sponsorship contract

  > [!TIP]
  > When a sponsorship payment status is marked as `Paid`, the system automatically syncs a corresponding revenue entry under source `Sponsorships`.

  ## 28.3 Revenue Analytics APIs

  - `GET /revenue/analytics/summary`: Aggregate total revenue, stream totals, source distribution, and monthly breakdown.
  - `GET /revenue/analytics/by-source`: Stream breakdown with amounts and exact percentage shares.
  - `GET /revenue/analytics/monthly`: Monthly revenue aggregation (month, year, amount, by-source map).
  - `GET /revenue/analytics/trends`: Chronological trend items over specified period (`?days=30`).

  ## 28.4 Database Integration & Alembic Migrations

  All revenue and sponsorship records are connected to `users.id` via foreign key `creator_id`.

  Schema migrations are handled by Alembic:
  ```bash
  # Generate migration
  $env:PYTHONPATH="."; python -m alembic revision --autogenerate -m "create_revenue_and_sponsorship_tables"

  # Apply migration or stamp head
  $env:PYTHONPATH="."; python -m alembic stamp head
  ```

  ## 28.5 Multi-Tenancy Security & Testing

  - **Security**: Access control is enforced via `get_current_user` dependency. Creators can view, modify, or delete only their own financial data. Requests attempting to access another creator's revenue/sponsorship IDs are rejected with `404 Not Found`.
  - **Test Suite**: Run unit tests via `$env:PYTHONPATH="."; py -m unittest discover backend/tests`. All 23 tests pass cleanly.

  ---

  # 29. Sprint 7: Notifications, Reporting & Exportable Reports (Milestone 3)

  Sprint 7 builds the notification & contextual alert system, reporting service, and publication-ready PDF & Excel export engines for CreatorIQ.

  ```text
  Creator Analytics & Revenue Data
                 ↓
          Reporting Service
                 ↓
     Notification & Alert Engines
                 ↓
       PDF / Excel Export Engines
                 ↓
  Creator Analytics & Reporting Dashboard
  ```

  ## 29.1 Notification & Alert System

  Automatically scans database metrics to generate contextual alerts across three categories:
  - **Performance Alerts**: View landmarks (e.g., content crossing 5,000+ total views) and content viral milestones.
  - **Engagement Notifications**: High engagement rate detection (>5.0%) and engagement drop warnings (<1.5%).
  - **Revenue & Payment Alerts**: Cumulative revenue goal achievements ($1,000+, $5,000+), YouTube AdSense updates, active brand deals, and pending sponsorship payout reminders.

  ### Notification APIs
  - `GET /notifications`: List creator notifications (supports `?unread_only=true` and `?type=...` filters)
  - `GET /notifications/unread-count`: Get integer count of unread notifications
  - `PUT /notifications/{id}/read`: Mark single notification as read
  - `PUT /notifications/read-all`: Mark all notifications as read for current creator
  - `POST /notifications/check-alerts`: Trigger real-time metric analysis to generate new alerts
  - `POST /notifications`: Manually create notification (system or test)
  - `DELETE /notifications/{id}`: Delete notification

  ## 29.2 Analytics Reports Service

  Consumes existing analytics, revenue, audience, and sponsorship logic without creating duplicate analytics code.

  ### Available Report Types:
  1. **Executive Comprehensive Report** (`executive_summary`)
  2. **Content Performance Report** (`content_performance`)
  3. **Audience Analytics Report** (`audience_analytics`)
  4. **Revenue Analytics Report** (`revenue_analytics`)
  5. **Growth Trends Report** (`growth_trends`)
  6. **Platform Comparison Report** (`platform_comparison`)

  ### Reporting APIs
  - `GET /reports/types`: List available report types and descriptions
  - `POST /reports/generate`: Generate live structured report JSON (supports `?save=true/false` and `date_range` horizon)
  - `GET /reports`: List saved reports history for current creator
  - `GET /reports/{id}`: Get details of saved report by ID
  - `DELETE /reports/{id}`: Delete saved report

  ## 29.3 PDF & Excel Export Engines

  ### PDF Export (`reportlab`)
  - Generates binary PDF streams (`application/pdf`) with custom primary navy header, creator profile box, KPI cards grid, formatted content & revenue breakdown tables, strategic insights, and page footer.
  - `POST /reports/export/pdf`: Stream live generated PDF document for download
  - `GET /reports/{id}/pdf`: Download PDF binary for saved report ID

  ### Excel Export (`openpyxl`)
  - Generates multi-tab `.xlsx` workbooks (`application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`):
    - `Executive Overview`: Summary metrics, KPI cards, strategic insights & actions.
    - `Content Performance`: ID, Title, Platform, Format, Views, Likes, Comments, Shares, Engagement Rate %, Published Date.
    - `Revenue & Sponsorships`: Stream breakdown percentages, contract amounts, deal statuses, payout statuses.
    - `Platform Comparison`: Cross-platform follower counts, view shares, engagement metrics.
  - `POST /reports/export/excel`: Stream live generated Excel spreadsheet for download
  - `GET /reports/{id}/excel`: Download Excel binary for saved report ID

  ## 29.4 Testing & Verification

  - **Backend Unittests**: Run `$env:PYTHONPATH="."; python -m unittest discover -s backend/tests`. All 32 unit & integration tests pass cleanly with 0 errors!
  - **Alembic Migration**: Migration revision `a8c9e01f2d34` creates `notifications` and `reports` PostgreSQL tables.
  - **Security**: Strict creator isolation (`creator_id == current_user.id`) enforced on all notification and report endpoints.

  ---

  # 30. Sprint 8: Frontend & Dashboard Integration Phase

  Sprint 8 connects all FastAPI backend APIs developed in previous sprints with a unified, responsive React dashboard UI.

  ```text
  React Dashboard UI
         ↓
    Axios / Fetch
         ↓
  FastAPI Backend (port 8000)
         ↓
  PostgreSQL Database
         ↓
  Real-Time Analytics & Financial Metrics
         ↓
  CreatorIQ Dashboard
  ```

  ## 30.1 Dashboard Architecture & Page Views

  The frontend is structured around a central layout containing a left navigation [`Sidebar`](file:///e:/Projects/Infosys_VIP/creator-iq-test/Creator-Analytics-Content-Performance-Dashboard/frontend/src/components/Sidebar.jsx) and top [`Header`](file:///e:/Projects/Infosys_VIP/creator-iq-test/Creator-Analytics-Content-Performance-Dashboard/frontend/src/components/Header.jsx).

  ### 8 Dedicated Dashboard Pages:
  1. **Dashboard** (`DashboardView`): Executive Overview, 8 KPI cards, Highlight Banners (Top Platform, Top Content), Donut & Bar Charts, and Quick Action shortcuts.
  2. **Content Analytics** (`ContentView`): Content Library table, views/likes/comments/shares/engagement calculations, platform filters, CRUD modals, and YouTube Sync.
  3. **Audience Analytics** (`AudienceView`): Demographics, device usage, age distribution, top countries/cities, and CRUD audience records table.
  4. **Growth & Trends** (`GrowthView`): 30-day historical follower growth log, virality trajectory, and impression charts.
  5. **Revenue & Sponsorships** (`RevenueView`): Financial stream breakdown by source, monthly revenue chart, sponsorship deal contract tracking, and payment status badges.
  6. **Notifications & Alerts** (`NotificationsView`): Notification list, category filter, unread filter, alert scan engine trigger button, mark read/unread, and deletion.
  7. **Reports & Export** (`ReportsView`): Report generator options, date range horizon selector, live structured preview card, PDF export download, Excel export download, and saved reports log.
  8. **Profile & Settings** (`SettingsView`): Profile details management (Full Name, Email, Password), connected social platform statuses, and FastAPI backend health status monitor.

  ## 30.2 Running Frontend & Backend

  ### Start FastAPI Backend:
  ```bash
  py -3.9 -m uvicorn backend.app.main:app --reload
  ```

  ### Start React Frontend Dev Server:
  ```bash
  cd frontend
  npm run dev
  ```

  ### Production Frontend Build:
  ```bash
  cd frontend
  npm run build
  ```

  ---

  ## API Base URL

  ```text
  http://127.0.0.1:8000
  ```

  ## Swagger

  ```text
  http://127.0.0.1:8000/docs
  ```

  ## ReDoc

  ```text
  http://127.0.0.1:8000/redoc
  ```

  ---

  # 31. Sprint 9: Multi-Platform Social Media Integration Phase

  Sprint 9 extends CreatorIQ from a YouTube-focused dashboard into a true multi-platform social media analytics engine by integrating **Instagram** alongside YouTube, implementing a **Common CreatorIQ Data Structure**, providing an **Instagram Service & Platform Synchronization Engine**, adding **Global Platform Filtering & Cross-Platform Comparison** to the React dashboard, and unit tests.

  ```text
  Social Media APIs (Instagram Graph API / YouTube Data API v3 / TikTok / LinkedIn / X)
                                     ↓
                          Fetch & Extract Metrics
                                     ↓
                    Transform to CreatorIQ Common Format
                                     ↓
                      Synchronize to PostgreSQL DB
                                     ↓
                    Omnichannel Analytics & Comparison
                                     ↓
              React Dashboard (Platform Filter & Comparison View)
  ```

  ## 31.1 Architecture Components Introduced in Sprint 9

  1. **Common CreatorIQ Data Structure**:
     - Standardized normalized data format across all social media platforms (`platform`, `external_content_id`, `content_title`, `views`, `likes`, `comments`, `shares`, `saves`, `watch_time`, `reach`, `published_date`).
  2. **Instagram Service (`instagram_service.py`)**:
     - Connects to Instagram Graph API (`/me/media`), transforms media objects into CreatorIQ Common Format, and synchronizes items into PostgreSQL contents & growth tables with duplicate record prevention.
  3. **Multi-Platform Router (`platforms.py`)**:
     - Endpoints:
       - `GET /social/platforms`: List connected and available platforms.
       - `POST /social/platforms/connect`: Connect social platform account.
       - `POST /social/platforms/{platform}/sync`: Synchronize Instagram, YouTube, TikTok, LinkedIn, or X.
       - `GET /social/platforms/comparison`: Fetch comparative metrics across platforms.
  4. **Analytics Service Platform Filtering (`analytics_service.py`)**:
     - Analytics static functions now accept an optional `platform` parameter (`YouTube`, `Instagram`, `TikTok`, `LinkedIn`, `X`, `All`).
  5. **React Global Platform Selector (`Header.jsx`)**:
     - Global dropdown header widget (`🌐 All Platforms`, `📺 YouTube`, `📸 Instagram`, `🎵 TikTok`, `💼 LinkedIn`, `🐦 X`).
  6. **Cross-Platform Comparison View (`PlatformComparison.jsx`)**:
     - Side-by-side performance cards comparing views volume, likes, comments, organic reach, and engagement rates across platforms.
  7. **Automated Platform Testing (`test_platforms.py`)**:
     - 37/37 passing backend unit tests covering Instagram service, Common Format transformer, PostgreSQL sync engine, and platform comparison API routes.



