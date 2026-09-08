# Sprint 2 — Content & Engagement Analytics

## Goal
Let creators log content (video/post/reel/etc.) with raw engagement
metrics, and expose analytics: engagement rate, top-performing content,
platform comparison, and KPI summaries.

## What was built

### Backend
- `Content` model: platform, content type, title, publish date, and raw
  counts (reach, impressions, likes, comments, shares, saves, views).
- **Engagement rate is computed, not stored** — `(likes+comments+shares+saves)/reach*100`,
  calculated fresh on every read in `content_service.py`. Storing it as a
  column would risk it going stale relative to the raw counts.
- Zero-reach content returns `0.0%` instead of crashing (division-by-zero guard).
- Full CRUD, scoped so a creator can only see/edit/delete their own content
  (enforced by filtering on `creator_id`, not just checking after the fact).
- Analytics endpoints: `/content/analytics/summary`, `/top-performing`,
  `/platform-comparison`.
- Date filtering and pagination on the content list endpoint.
- **Route ordering matters**: the `/analytics/*` routes are declared
  *before* `/{content_id}` in the router, otherwise FastAPI would try to
  parse `"analytics"` as a UUID and 422 the request. There's a regression
  test for this specifically.

### Frontend
- Content Analytics page: KPI cards, a platform-comparison bar chart
  (Recharts), and a top-performing-content table.
- New `contentService.js` API layer.

### Testing note (a real bug I caught and fixed)
Initially `test_auth.py` and `test_content.py` each set up their own
SQLite engine and called `app.dependency_overrides[get_db] = ...`
independently. Since `dependency_overrides` is a single shared dict on
the `app` object, whichever file's override was applied last silently
overrode the other — so running both files together made one file's
requests hit the other file's (already torn down) database, causing
random-looking failures depending on file import order.

**Fix**: moved test DB setup into `tests/conftest.py` so there's exactly
one engine and one override, shared by every test file. Verified the fix
by running the suite in both file orders — 15/15 pass either way.

## Known limitations
- No bulk-import endpoint for content yet (e.g. CSV upload) — out of scope
  for this sprint; content is created one at a time via the API.
- Top-performing content sorts in Python after fetching up to 200 recent
  rows, not a SQL `ORDER BY`, since engagement rate isn't a stored column.
  Fine at this data scale; would need a materialized/stored rate column
  if a creator ever has thousands of content items.

## How to verify
```bash
cd backend && pytest tests/ -v   # 15 passed
cd frontend && npm run build     # builds clean
```
Log in, then visit `/analytics/content`. It'll be empty until content
exists — create some via `POST /api/content/` in Swagger (`/docs`) with
a valid JWT, then refresh the page.
