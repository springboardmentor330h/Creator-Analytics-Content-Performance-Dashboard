# CreatorIQ Backend – Multi-Platform Social Media Integration & Analytics

CreatorIQ Backend is a high-performance Python FastAPI service providing creator authentication, social media connection management, automated content synchronization, and analytics calculations stored in PostgreSQL.

---

## 1. Supported Platforms & Status

The backend provides integration routes and sync architectures for 6 social media platforms:

- **YouTube**: Live API integration via YouTube Data API v3 (videos, snippets, statistics, channel search, OAuth 2.0).
- **Instagram**: Live API integration via Meta Graph API v18.0 with automated manual fallback when developer credentials are unconfigured.
- **TikTok**: Open API v2 architecture with standardized CreatorIQ data mapping and manual data synchronization.
- **Facebook**: Meta Graph API architecture with standardized CreatorIQ data mapping and manual data synchronization.
- **LinkedIn**: Community Management API architecture with standardized CreatorIQ data mapping and manual data synchronization.
- **X (Twitter)**: Twitter API v2 architecture with standardized CreatorIQ data mapping and manual data synchronization.

---

## 2. Synchronization Architecture & Common CreatorIQ Format

```
External API / Form Input
         │
         ▼
Platform Service (fetch_data)
         │
         ▼
Transformation Engine (Common CreatorIQ Format)
         │
         ▼
Data Validation (Types, ranges, required values)
         │
         ▼
Idempotent Duplicate Detection
[creator_id + platform + external_content_id]
         │
         ├─── Existing record? ──► UPDATE metrics
         │
         └─── New record? ───────► INSERT into Content table
         │
         ▼
Update SocialConnection.last_synced_at
         │
         ▼
Return StandardSyncResponse
```

### Standardized Common Format:
```json
{
  "platform": "YouTube",
  "external_content_id": "yt_vid_123",
  "content_title": "FastAPI Full-Stack Masterclass",
  "content_type": "Video",
  "views": 25000,
  "likes": 1800,
  "comments": 220,
  "shares": 140,
  "reach": 30000,
  "published_date": "2026-08-10"
}
```

---

## 3. Endpoints Implemented

### Connection Management:
- `GET /social/connections`: Returns current creator's connected platforms summary (`platform`, `status`, `account_name`, `last_synced_at`, `connection_mode`).
- `GET /api/social/connections`: Returns all 6 social connection statuses with permission scopes.
- `POST /social/connect`: Connects platform account by handle or name.
- `POST /social/{platform}/connect`: Connects specific platform account and executes initial synchronization.
- `DELETE /api/social/{platform}`: Safely disconnects account and wipes encrypted access tokens.

### Dedicated Platform Sync Endpoints:
- `POST /social/youtube/sync`: Live YouTube Data API v3 sync with duplicate handling.
- `POST /social/instagram/sync`: Meta Graph API / Instagram sync with duplicate handling.
- `POST /social/tiktok/sync`: TikTok sync with duplicate handling.
- `POST /social/facebook/sync`: Facebook sync with duplicate handling.
- `POST /social/linkedin/sync`: LinkedIn sync with duplicate handling.
- `POST /social/x/sync` (and `/social/twitter/sync`): X (Twitter) sync with duplicate handling.
- `POST /social/{platform}/sync`: General platform sync endpoint.

### Dashboard Analytics Endpoints:
- `GET /analytics/summary` (supports `?platform=` and `?source=database|live`)
- `GET /analytics/top-content` (supports `?platform=`)
- `GET /analytics/platform-comparison` (supports `?source=database|live`)
- `GET /analytics/chart/engagement` (supports `?platform=`)
- `GET /analytics/chart/followers` (supports `?platform=`)

---

## 4. Idempotency & Duplicate Prevention

- Repeated syncs are strictly idempotent.
- Records are checked against `(Content.creator_id == user.id, Content.platform == platform, Content.external_content_id == ext_id)`.
- If a record is already present, its metrics (`views`, `likes`, `comments`, `shares`, `reach`, `engagement_rate`, `updated_at`) are updated without inserting redundant rows.

---

## 5. Security & Isolation

- **Token Security**: OAuth access and refresh tokens are encrypted at rest using `Fernet` symmetric encryption. Tokens are never exposed in user-facing schemas.
- **Creator Isolation**: Every analytics and content query filters by `creator_id == current_user.id`.
- **Environment Secrets**: API keys, database credentials, and secrets are stored in `.env` and loaded via Pydantic Settings.

---

## 6. Testing

Run all backend unit and integration tests:
```powershell
.\venv\Scripts\pytest creatoriq_backend/tests/
```
All 93 tests pass with 0 failures.
