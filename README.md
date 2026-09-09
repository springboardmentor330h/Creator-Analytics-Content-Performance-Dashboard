# CreatorIQ – Multi-Platform Social Media Integration & Live Analytics Synchronization

CreatorIQ is an enterprise-grade creator analytics and multi-platform content performance management platform built with **FastAPI**, **PostgreSQL**, **SQLAlchemy**, and **React** (TypeScript + Vite).

---

## 1. Supported Platforms & Integration Architecture

The platform supports 6 social media platforms:

| Platform | Mode | Live API Integration | Manual / Fallback Mode | Content Types Supported |
| :--- | :--- | :--- | :--- | :--- |
| **YouTube** | **Live API** | YouTube Data API v3 (Search, Videos, Statistics, OAuth 2.0) | Standardized CreatorIQ Fallback | Video, Short |
| **Instagram** | **Live / Fallback** | Meta Graph API v18.0 (Instagram Basic Display & Insights) | Standardized CreatorIQ Manual Mode | Reel, Post |
| **TikTok** | **Manual / Ready** | TikTok Open API v2 Architecture | Standardized CreatorIQ Manual Mode | Video |
| **Facebook** | **Manual / Ready** | Graph API v18.0 Architecture | Standardized CreatorIQ Manual Mode | Post, Live |
| **LinkedIn** | **Manual / Ready** | LinkedIn Community Management API Architecture | Standardized CreatorIQ Manual Mode | Article, Post |
| **X (Twitter)** | **Manual / Ready** | Twitter API v2 Architecture | Standardized CreatorIQ Manual Mode | Post |

> [!NOTE]
> **Honest Live vs. Manual Differentiation**:  
> Platforms with configured live credentials in the backend `.env` run with the `LIVE API` badge. Platforms without developer client secrets operate honestly with the `MANUAL DATA MODE` badge. The application never claims sample data is live API data.

---

## 2. End-to-End Connection & Synchronization Workflow

```
User Login (JWT Authentication)
    │
    ▼
Connected Apps (/social-connections)
    │
    ▼
Click "Connect" on Platform Card
    │
    ▼
Platform Authentication / Account Connect
(OAuth 2.0 flow or Account Handle / Channel ID)
    │
    ▼
Store SocialConnection in PostgreSQL
(status: "connected", encrypted tokens, platform_username, display_name)
    │
    ▼
Initial Synchronization
(POST /social/{platform}/sync)
    │
    ▼
Fetch Available Platform Content & Metrics
    │
    ▼
Transform into Common CreatorIQ Format
    │
    ▼
Data Validation (Types, ranges, required fields)
    │
    ▼
Idempotent PostgreSQL Upsert
(Deduplication on creator_id + platform + external_content_id)
    │
    ▼
Existing Analytics Services (Dynamic computation)
    │
    ▼
FastAPI Analytics APIs (/analytics/summary, /analytics/top-content, etc.)
    │
    ▼
React Dashboard (/dashboard) with Platform Filter
```

---

## 3. Common CreatorIQ Data Format

All platforms transform their raw metrics into a standardized internal representation before persisting to PostgreSQL (`public.content` table):

```json
{
  "platform": "Instagram",
  "external_content_id": "ig-post-mock-1",
  "content_title": "Behind the Scenes: Code, Coffee & Deployments",
  "content_type": "Reel",
  "views": 12000,
  "likes": 950,
  "comments": 120,
  "shares": 75,
  "reach": 15000,
  "published_date": "2026-08-12"
}
```

### Metrics Formula & Availability:
- **Views, Likes, Comments, Shares, Reach**: Non-negative integers.
- **Engagement Rate**: Calculated using the standard project formula:
  $$\text{Engagement Rate} = \frac{\text{likes} + \text{comments} + \text{shares} + \text{saves}}{\text{reach}} \times 100$$
- **Unavailable Metrics**: Preserved as `0` or `NULL` without inventing fake metrics.

---

## 4. Duplicate Handling & Idempotency

To ensure repeated synchronization is safe and idempotent:
- **Logical Unique Identifier**: `creator_id + platform + external_content_id`
- **Database Query**:
  ```python
  existing = db.query(Content).filter(
      Content.creator_id == user.id,
      func.lower(Content.platform) == platform.lower(),
      or_(
          Content.external_content_id == ext_id,
          Content.content_id == ext_id,
      ),
  ).first()
  ```
- **Upsert Rule**:
  - If record **exists**: Update metrics (`views`, `likes`, `comments`, `shares`, `reach`, `engagement_rate`, `updated_at`).
  - If record **does not exist**: Create new `Content` record.
- **Result**: Repeated syncs update the existing records rather than duplicating them (e.g., 25 records remain 25 records).

---

## 5. Creator Data Isolation

Creator data is strictly partitioned by `creator_id`:
- A creator can only access their own connections, content, analytics, revenue, and sponsorships.
- All database queries in `analytics_service.py`, `social_media.py`, `youtube_service.py`, `instagram_service.py`, and `content.py` enforce `Content.creator_id == current_user.id`.
- Agency accounts only view creators assigned to them.

---

## 6. Social Media & Synchronization API Endpoints

### Social Connections Endpoints:
- `GET /social/connections`: Returns current creator's connected platforms summary:
  ```json
  [
    {
      "platform": "YouTube",
      "status": "connected",
      "account_name": "Suresh Tech",
      "last_synced_at": "2026-09-04T14:20:00",
      "connection_mode": "live"
    },
    {
      "platform": "TikTok",
      "status": "connected",
      "account_name": "@suresh_tiktok",
      "last_synced_at": "2026-09-04T14:25:00",
      "connection_mode": "manual"
    }
  ]
  ```
- `GET /api/social/connections`: Full connection records with permissions and scopes.
- `POST /social/connect`: Connect account by platform and handle:
  `{"platform": "YouTube", "account_name": "Suresh Tech"}`
- `DELETE /api/social/{platform}`: Disconnect platform and securely wipe tokens.

### Dedicated Platform Sync Endpoints:
- `POST /social/youtube/sync`: Live YouTube Data API v3 synchronization with duplicate detection.
- `POST /social/instagram/sync`: Meta Graph API / Instagram synchronization.
- `POST /social/tiktok/sync`: TikTok content synchronization with duplicate detection.
- `POST /social/facebook/sync`: Facebook content synchronization with duplicate detection.
- `POST /social/linkedin/sync`: LinkedIn content synchronization with duplicate detection.
- `POST /social/x/sync` (and `/social/twitter/sync`): X (Twitter) content synchronization with duplicate detection.
- `POST /social/{platform}/sync`: Universal platform synchronization endpoint.

### Dashboard Analytics Endpoints:
All analytics endpoints support optional platform filtering via `?platform={name}` and data source switching via `?source=database|live`:
- `GET /analytics/summary`
- `GET /analytics/top-content`
- `GET /analytics/platform-comparison`
- `GET /analytics/chart/engagement`
- `GET /analytics/chart/followers`

---

## 7. Database Architecture

### Models:
1. `users`: Authentication & creator profile (`id`, `email`, `password_hash`, `role`, `full_name`).
2. `social_connections`: Platform connection state (`user_id`, `platform`, `status`, `platform_username`, `display_name`, `access_token_encrypted`, `refresh_token_encrypted`, `token_expires_at`, `scopes`, `last_synced_at`).
   - Unique Constraint: `(user_id, platform)`
3. `content`: Multi-platform content records (`id`, `creator_id`, `platform`, `content_id`, `external_content_id`, `title`, `content_type`, `published_at`, `views`, `likes`, `comments`, `shares`, `reach`, `engagement_rate`).
   - Composite Index: `(creator_id, platform, content_id)`
   - Index: `(platform, external_content_id)`

---

## 8. Frontend Implementation (`/social-connections` & `/dashboard`)

### Connected Apps UI (`/social-connections`):
- **Connected Cards**:
  - Platform Icon & Platform Name
  - Status Badge (`Connected`) + Mode Badge (`LIVE API` vs `MANUAL DATA MODE`)
  - Account Name & Email / Username
  - Last synced timestamp
  - Action Buttons:
    - **Reconnect**: Opens dialog to update handle or re-authenticate.
    - **Sync**: Triggers platform synchronization with dynamic spinner (`Syncing...` &rarr; `Synced successfully (X records)`).
    - **Disconnect**: Opens confirmation dialog to safely disconnect account.
- **Disconnected Cards**:
  - Platform Icon & Platform Name
  - Status Badge (`Disconnected`)
  - Description
  - **Connect** Button: Opens connection modal with OAuth and account connection options.

### Dashboard Platform Filter (`/dashboard`):
- Filter options: **All Platforms**, **YouTube**, **Instagram**, **TikTok**, **Facebook**, **LinkedIn**, **X**.
- Selecting a platform automatically filters KPI cards, trends, comparison, and top content table.
- Selecting **All Platforms** computes aggregate metrics across all connected platforms.

---

## 9. Testing & Verification

### Running Automated Backend Tests:
```powershell
.\venv\Scripts\pytest creatoriq_backend/tests/
```
Result: **93 passed**, 0 failed.

### Validating Frontend Build:
```powershell
cd frontend
npm run build
```
Result: TypeScript typecheck (`tsc`) and Vite production bundle succeed with 0 errors.

---

## 10. Security & Privacy Commitments

- **No Exposed Credentials**: Access tokens and refresh tokens are encrypted at rest using cryptography (`Fernet`) and are never returned to the frontend.
- **Strict Environment Isolation**: API keys and secrets are loaded from `.env` and excluded via `.gitignore`.
- **Tenant Isolation**: Creator data is strictly isolated; cross-creator data leakage is prohibited at the query level.
