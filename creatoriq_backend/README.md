# CreatorIQ – Real YouTube API Integration & End-to-End Analytics (Sprint 5)

CreatorIQ is an enterprise-grade creator analytics and multi-platform content performance management platform built with FastAPI, PostgreSQL, SQLAlchemy, and OAuth / Social Data Integrations.

---

## 1. Project Overview

CreatorIQ provides multi-tenant and role-based performance analytics for digital content creators, marketing teams, agencies, and administrators. Sprint 5 extends the platform to support **Real YouTube Data API v3 integration**, enabling creators and agencies to seamlessly synchronize YouTube video metadata and performance metrics into PostgreSQL, transform them into a normalized cross-platform format, and power aggregated dashboard KPIs without duplicating analytics business logic.

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
                                  |       (content table)       |
                                  +--------------+--------------+
                                                 |
                                                 v
                                  +-----------------------------+
                                  |    app/services/            |
                                  |    analytics_service.py     |
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
- **Data Models (`app/models/content.py`)**: SQLAlchemy `Content` model with `external_content_id` for tracking platform-native IDs and enabling idempotent upserts.
- **Data Schemas (`app/schemas/content.py`, `app/schemas/social_connection.py`)**: Pydantic v2 schemas for request validation, serialization, and YouTube sync payload/responses (`YouTubeSyncRequest`, `YouTubeSyncResponse`).
- **YouTube Service (`app/services/youtube_service.py`)**: Google API client management, data fetching, transformation into CreatorIQ common schema, validation, duplicate check, and PostgreSQL upsert logic.
- **Social Router (`app/routers/social.py`)**: Exposes `POST /social/youtube/sync` for background and manual synchronization.
- **Analytics Service (`app/services/analytics_service.py`)**: Aggregated metrics calculation (KPI summary, top content, platform comparison, engagement curves, follower growth) from PostgreSQL data.

---

## 4. API Endpoints

### Authentication & Users
- `POST /auth/register` – Register a new user (Creator, Agency, Marketing Team, Administrator).
- `POST /auth/login` – Authenticate user and receive JWT access token.
- `GET /users/me` – Retrieve current user profile.

### Social & YouTube Integration (Sprint 5)
- `POST /social/youtube/sync` – Synchronize YouTube videos and metrics into PostgreSQL.
  - **Request Body (Optional)**:
    ```json
    {
      "channel_id": "UC_x5XG1OV2P6uZZ5FSM9Ttw",
      "query": "Python Tutorial",
      "max_results": 10
    }
    ```
  - **Response (200 OK)**:
    ```json
    {
      "platform": "YouTube",
      "status": "success",
      "records_synced": 10
    }
    ```
- `POST /social/connect` – Connect a social media platform account.
- `GET /social/platforms` – List connected social platforms.
- `POST /social/sync` – Synchronize simulated social platform data.

### Analytics Endpoints
- `GET /analytics/summary` – Aggregate KPI totals (views, likes, comments, shares, reach, followers, avg engagement rate).
- `GET /analytics/top-content` – Top performing content ranked by engagement rate.
- `GET /analytics/platform-comparison` – Cross-platform performance comparison (YouTube, Instagram, TikTok, LinkedIn, etc.).
- `GET /analytics/chart/engagement` – Chronological engagement rate timeline data.
- `GET /analytics/chart/followers` – Chronological follower growth timeline data.
- `GET /analytics/content/{id}/engagement` – Detailed metrics for a single content item.

---

## 5. Database Tables

### `public.content`
Stores normalized content across all social media platforms:

| Column | Type | Constraints / Description |
| :--- | :--- | :--- |
| `id` | Integer | Primary key, Auto-increment |
| `creator_id` | Integer | Foreign key to `users.id`, Indexed |
| `platform` | String(50) | 'YouTube', 'Instagram', 'TikTok', 'Facebook', 'X', 'LinkedIn' |
| `content_id` | String(150) | Internal / backward-compatible unique identifier |
| `external_content_id` | String(150) | Native video/post ID from platform (Indexed) |
| `title` | String(255) | Content title or headline |
| `content_type` | String(50) | 'Video', 'Short', 'Post', 'Reel', 'Article', 'Live' |
| `published_at` | Date | Publication date |
| `views` | Integer | Total views (default: 0) |
| `likes` | Integer | Total likes (default: 0) |
| `comments` | Integer | Total comments (default: 0) |
| `shares` | Integer | Total shares (default: 0) |
| `saves` | Integer | Total saves / bookmarks (default: 0) |
| `watch_time` | Integer | Watch time in minutes (default: 0) |
| `reach` | Integer | Total reach / impressions (default: 0) |
| `engagement_rate` | Float | Calculated percentage `((likes+comments+shares+saves)/reach)*100` |
| `created_at` | DateTime | Creation timestamp (UTC) |
| `updated_at` | DateTime | Last updated timestamp (UTC) |

---

## 6. YouTube API Integration

The YouTube integration interacts directly with the **YouTube Data API v3**:
1. Uses `google-api-python-client` to initialize an authorized service client.
2. Supports fetching channel video feeds via uploads playlist (`channels().list` -> `playlistItems().list`), keyword search (`search().list`), or popular videos (`videos().list(chart="mostPopular")`).
3. Fetches precise video statistics (`viewCount`, `likeCount`, `commentCount`) and snippet metadata (`title`, `publishedAt`).
4. Extracts only non-fabricated API metrics.

---

## 7. Environment Configuration

Configuration is loaded from `.env` via `app/core/config.py`:

```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/creatoriq
JWT_SECRET_KEY=your-secure-random-jwt-secret-key
JWT_ALGORITHM=HS256
JWT_EXPIRE_MINUTES=1440
FRONTEND_URL=http://localhost:5173

# YouTube API Credentials
YOUTUBE_API_KEY=your_google_api_key_here
YOUTUBE_CLIENT_ID=your_oauth_client_id_here
YOUTUBE_CLIENT_SECRET=your_oauth_client_secret_here
GOOGLE_REDIRECT_URI=http://localhost:5173/api/social/youtube/callback
```

> **Security Note:** The `.env` file is excluded from Git tracking via `.gitignore`. Never commit API keys or production secrets to source control.

---

## 8. Data Transformation Workflow

Raw responses from YouTube API v3 are transformed into CreatorIQ's canonical cross-platform representation:

```json
{
    "platform": "YouTube",
    "external_content_id": "dQw4w9WgXcQ",
    "content_title": "Python Asyncio & FastAPI Masterclass",
    "views": 25000,
    "likes": 1800,
    "comments": 220,
    "shares": 0,
    "reach": 0,
    "published_date": "2026-08-10"
}
```

This ensures future platforms (Instagram, TikTok, LinkedIn, X, Facebook) integrate smoothly into the exact same analytics engine without duplicate logic.

---

## 9. Synchronization Workflow

1. Client triggers `POST /social/youtube/sync` with authorization bearer token.
2. The router delegates execution to `youtube_service.sync_youtube_data()`.
3. YouTube service loads API key, queries YouTube Data API v3, and retrieves video batches.
4. Each raw record is parsed by `transform_youtube_data()` and verified with `validate_youtube_data()`.
5. Database session queries for existing records matching `creator_id`, `platform = "YouTube"`, and `external_content_id`.
6. Upsert execution updates existing rows or creates new records.
7. Database commit is performed and response `{ "platform": "YouTube", "status": "success", "records_synced": N }` is returned.

---

## 10. Duplicate Handling

Duplicate detection is strictly enforced at the database and service layer using:

$$\text{creator\_id} + \text{platform} + \text{external\_content\_id}$$

- **If record exists**: The service updates the existing record's views, likes, comments, title, publication date, and recalculates the engagement rate.
- **If record does not exist**: A new record is inserted.
- Running synchronization repeatedly is idempotent and does not result in duplicate records in PostgreSQL.

---

## 11. Error Handling

All external and internal failures are handled gracefully without application crashes or credential leaks:

| Scenario | HTTP Status | Detail / Behavior |
| :--- | :--- | :--- |
| Missing API Key | `400 Bad Request` | Clean error informing user that API key is not configured |
| Invalid API Key | `401 Unauthorized` / `400 Bad Request` | Informs client of invalid credentials without revealing key |
| Channel / Video Not Found | `404 Not Found` | Specified YouTube resource not found |
| Quota Exceeded | `429 Too Many Requests` | Rate limit / quota notification |
| Empty API Results | `200 OK` | `{ "platform": "YouTube", "status": "success", "records_synced": 0 }` |
| Database Error | `500 Internal Server Error` | Transaction rolled back (`db.rollback()`) safely |

---

## 12. Swagger Testing

1. Start the FastAPI backend:
   ```bash
   uvicorn main:app --reload --host 127.0.0.1 --port 8000
   ```
2. Navigate to Swagger UI: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)
3. Authenticate using `POST /auth/login` to obtain an access token and authorize via the **Authorize** button (`Bearer <token>`).
4. Execute `POST /social/youtube/sync`:
   - Verify `200 OK` response with `status: success` and `records_synced`.
5. Execute analytics endpoints:
   - `GET /analytics/summary` – Verify total views, likes, comments, and engagement rate reflect the synchronized YouTube data.
   - `GET /analytics/top-content` – Verify YouTube videos appear in top content rankings.
   - `GET /analytics/platform-comparison` – Verify "YouTube" is present in platform comparison breakdown.
   - `GET /analytics/chart/engagement` – Verify engagement time series includes YouTube publication dates.
   - `GET /analytics/chart/followers` – Verify follower trend data.

---

## 13. PostgreSQL Verification

Run the following queries in **pgAdmin** or `psql` to verify synchronized records and duplicate handling:

```sql
-- 1. View all synchronized content
SELECT *
FROM public.content
ORDER BY id DESC;

-- 2. Verify external_content_id and YouTube performance metrics
SELECT
    id,
    creator_id,
    platform,
    external_content_id,
    title,
    views,
    likes,
    comments,
    published_at
FROM public.content
WHERE platform = 'YouTube'
ORDER BY id DESC;

-- 3. Verify deduplication (count should not multiply on repeated sync)
SELECT
    platform,
    external_content_id,
    COUNT(*) AS record_count
FROM public.content
GROUP BY platform, external_content_id
HAVING COUNT(*) > 1;
-- (Should return 0 rows)
```

---

## How to Run Tests

To execute the automated test suite:

```bash
pytest -v
```

To run Sprint 5 YouTube integration tests specifically:

```bash
pytest tests/test_youtube_sprint5.py -v
```
