# CreatorIQ – Multi-Platform Social Media Analytics & Content Performance Dashboard

CreatorIQ is an enterprise-grade creator analytics and multi-platform content performance management platform built with **FastAPI**, **PostgreSQL**, **SQLAlchemy**, and **React**.

> **Important Integration Notice:**  
> Live API integration is used where credentials/access are available (such as YouTube Data API v3). For platforms where API access is unavailable, realistic sample data is stored in PostgreSQL through the same backend architecture and standardized data schemas.

---

## 1. Project Overview

CreatorIQ provides multi-tenant and role-based performance analytics for digital content creators, marketing teams, agencies, and administrators. The Multi-Platform Analytics System extends CreatorIQ beyond YouTube to comprehensively support:
- **YouTube** (Live Data API v3 & Ingestion)
- **Instagram** (PostgreSQL Platform Ingestion / Reels & Posts)
- **Facebook** (PostgreSQL Platform Ingestion / Pages & Live)
- **LinkedIn** (PostgreSQL Platform Ingestion / Professional Articles & Posts)

All platforms adhere to a unified **Common Platform Format** stored in PostgreSQL. The same analytics engine calculates KPI cards, chronological trends, rankings, and platform benchmarking without duplicated logic.

---

## 2. Multi-Platform System Architecture

```
YouTube:
  YouTube Data API v3 ───┐
                         │
Additional Platforms:    ▼
  Manual / Sample Data ──┼──> Common CreatorIQ Format ──> Duplicate Detection ──> PostgreSQL
  (Instagram/FB/LinkedIn)│                                (platform + ext_id)         │
                         │                                                            ▼
Live APIs (When Avail) ─┘                                                    Analytics Services
                                                                                      │
                                                                                      ▼
                                                                                 FastAPI APIs
                                                                             (?platform= filterable)
                                                                                      │
                                                                                      ▼
                                                                               React Dashboard
```

---

## 3. Supported Platforms

| Platform | Ingestion Workflow | Content Types Supported | Status |
| :--- | :--- | :--- | :--- |
| **YouTube** | Live API v3 / Sync Service | Video, Short | Active (Live Sync) |
| **Instagram** | PostgreSQL Ingestion / Common Format | Reel, Post | Active (Database Ingestion) |
| **Facebook** | PostgreSQL Ingestion / Common Format | Post, Live | Active (Database Ingestion) |
| **LinkedIn** | PostgreSQL Ingestion / Common Format | Article, Post | Active (Database Ingestion) |
| **TikTok** | Common Schema Ready | Short, Video | Coming Soon |
| **X (Twitter)** | Common Schema Ready | Post | Coming Soon |

---

## 4. Common Platform Data Format

All social platforms ingest data using an identical internal payload structure:

```json
{
  "platform": "Instagram",
  "external_content_id": "IG101",
  "content_title": "Behind the Scenes: High-Performance Server Rack Setup",
  "content_type": "Reel",
  "views": 28500,
  "likes": 2950,
  "comments": 240,
  "shares": 380,
  "reach": 26000,
  "published_date": "2026-05-04"
}
```

### Standardized Database Fields (`public.content` table):
- `platform`: `YouTube`, `Instagram`, `Facebook`, `LinkedIn`, `TikTok`, `X`
- `external_content_id`: Native platform unique identifier (Indexed)
- `title` / `content_title`: Content headline or title
- `content_type`: `Video`, `Short`, `Post`, `Reel`, `Article`, `Live`
- `published_at` / `published_date`: Publication date (`YYYY-MM-DD`)
- `views`: Non-negative view count
- `likes`: Reaction / like count
- `comments`: Comment count
- `shares`: Share / retweet count
- `reach`: Audience reach / impressions
- `engagement_rate`: Normalized engagement metric calculated as:
  $$\text{Engagement Rate} = \frac{\text{likes} + \text{comments} + \text{shares} + \text{saves}}{\text{reach}} \times 100$$

---

## 5. Duplicate Handling (Upsert Logic)

To prevent duplicate records when synchronizing or entering platform data multiple times:
- Logical Unique Key: `creator_id + platform + external_content_id`
- **Synchronization / Insert Behavior**:
  - **Existing record?**
    - `YES` &rarr; **Update** existing record metrics (`views`, `likes`, `comments`, `shares`, `reach`, `engagement_rate`, `updated_at`).
    - `NO` &rarr; **Create** new record with native platform identifier.

---

## 6. Analytics Workflow & Platform Filtering

The central `analytics_service.py` provides cross-platform calculations for all supported platforms:

### 1. Dashboard Summary (`GET /analytics/summary`)
Supports `?platform=YouTube|Instagram|Facebook|LinkedIn`:
- When **All Platforms** is selected: combined PostgreSQL metrics across all platforms.
- When **YouTube / Instagram / Facebook / LinkedIn** is selected: filters to that platform only.
- Calculates:
  - Total Views
  - Total Likes
  - Total Comments
  - Total Shares
  - Total Reach
  - Total Followers (attributing proportional platform audience)
  - Average Engagement Rate

### 2. Platform Comparison (`GET /analytics/platform-comparison`)
Returns database-derived breakdown for all platforms with data:
```json
{
  "YouTube": {
    "views": 621000,
    "reach": 584500,
    "engagement_rate": 12.16,
    "likes": 52580,
    "comments": 4540
  },
  "Instagram": {
    "views": 497200,
    "reach": 451000,
    "engagement_rate": 18.15,
    "likes": 57350,
    "comments": 4855
  },
  "Facebook": {
    "views": 310000,
    "reach": 281400,
    "engagement_rate": 12.55,
    "likes": 25670,
    "comments": 3665
  },
  "LinkedIn": {
    "views": 408500,
    "reach": 379500,
    "engagement_rate": 13.51,
    "likes": 35350,
    "comments": 4605
  }
}
```

### 3. Chronological Charts & Content Ranking
- `GET /analytics/chart/engagement?platform={name}` &ndash; Chronological engagement rate timeline.
- `GET /analytics/chart/followers` &ndash; Follower growth timeline from Growth table.
- `GET /analytics/top-content?platform={name}` &ndash; Top 5 content items ranked by engagement rate.

---

## 7. Frontend Features & Routing

1. **Dashboard Platform Selector**:
   - `Platform: [ All Platforms ▼ ]` dropdown with options:
     - `All Platforms`
     - `YouTube`
     - `Instagram`
     - `Facebook`
     - `LinkedIn`
   - Dynamically re-fetches all 7 KPI cards, engagement trends, top content, and platform distribution.
2. **Dedicated Platform Pages**:
   - `/platform/:platformId` or `/youtube`, `/instagram`, `/facebook`, `/linkedin`
   - Implemented platforms display platform metrics, status badge ("Live API" vs "Manual Data / PostgreSQL"), engagement trend, and top posts.
   - Unimplemented platforms (e.g. TikTok, X) display a clean **"Coming Soon"** state instead of redirecting to the landing page.
3. **Social Media Page (`/social-connections`)**:
   - Displays YouTube, Instagram, Facebook, and LinkedIn.
   - Shows state badges: `Connected`, `Manual Data`, `Sync Available`.
   - Direct button to View Platform Analytics without undefined URL bounces.

---

## 8. How to Run the Application

### Backend (FastAPI & PostgreSQL)

1. Activate virtual environment and navigate to backend directory:
   ```powershell
   cd creatoriq_backend
   ..\venv\Scripts\activate
   ```
2. Verify `.env` configuration:
   ```env
   DATABASE_URL=postgresql://postgres:postgres@localhost:5432/creatoriq
   JWT_SECRET_KEY=your-jwt-secret-key
   YOUTUBE_API_KEY=your_optional_youtube_key
   ```
3. Seed multi-platform dataset (creates 12+ items per platform = 48+ items):
   ```powershell
   python seed_multiplatform.py
   ```
4. Start development server:
   ```powershell
   uvicorn main:app --reload --host 127.0.0.1 --port 8000
   ```

### Frontend (React & Vite)

1. Navigate to frontend:
   ```powershell
   cd frontend
   ```
2. Start development server:
   ```powershell
   cmd /c npm run dev
   ```
3. Open [http://localhost:5173](http://localhost:5173) in browser.
4. Log in using demo credentials:
   - **Email:** `creator@creatoriq.dev`
   - **Password:** `Password123!`

---

## 9. Verification & Testing Procedure

### A. Automated Backend Tests
Run the comprehensive test suite (all 85 tests):
```powershell
pytest -v
```

### B. Swagger UI Testing
1. Navigate to: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)
2. Log in at `POST /auth/login` and paste the JWT token into the **Authorize** dialog.
3. Test endpoints:
   - `POST /content` (verify content creation and duplicate prevention with same `external_content_id`)
   - `GET /content` (verify pagination and total content count)
   - `GET /content/{id}` (verify fetching single item)
   - `GET /analytics/summary` (test with and without `platform=Instagram`)
   - `GET /analytics/top-content` (test with and without `platform=Facebook`)
   - `GET /analytics/platform-performance` (grouped totals)
   - `GET /analytics/chart/engagement` (time series)
   - `GET /analytics/chart/followers` (growth curve)
   - `GET /analytics/platform-comparison` (YouTube, Instagram, Facebook, LinkedIn breakdown)

### C. pgAdmin / PostgreSQL Verification Queries
Run in pgAdmin Query Tool:

```sql
-- 1. Check content distribution across platforms (should show 10+ records for YouTube, Instagram, Facebook, LinkedIn)
SELECT platform, COUNT(*) AS total_records
FROM public.content
GROUP BY platform
ORDER BY total_records DESC;

-- 2. View recent content records
SELECT id, creator_id, platform, external_content_id, title, views, likes, comments, shares, reach, engagement_rate, published_at
FROM public.content
ORDER BY published_at DESC;

-- 3. Verify duplicate prevention (should return 0 rows)
SELECT platform, external_content_id, COUNT(*)
FROM public.content
WHERE external_content_id IS NOT NULL
GROUP BY platform, external_content_id
HAVING COUNT(*) > 1;

-- 4. Verify social connections status
SELECT user_id, platform, status, last_synced_at
FROM public.social_connections;
```

---

## 10. Security Practices

- `.env` files and production credentials are excluded from Git tracking via `.gitignore`.
- Password hashes use salted bcrypt via PassLib.
- User data isolation is enforced across all analytics queries via `_apply_scope` to prevent cross-tenant data leakage.
