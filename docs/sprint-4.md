# Sprint 4 — Multi-Platform Analytics

## Goal
A unified, normalized view across YouTube, Instagram, and TikTok so the
dashboard can compare platforms on equal footing — even though only
YouTube has real integrated data so far.

## What was built

### Backend
- **`PlatformSnapshot`**: one normalized shape (`followers`,
  `total_content`, `total_reach`, `avg_engagement_rate`,
  `growth_rate_percent`, `is_mock_data`) that every platform maps into,
  regardless of where its data actually comes from.
- **Mock data service** (`mock_platform_service.py`), clearly separated:
  Instagram and TikTok don't have real integrations yet (YouTube's real
  API lands in Sprint 5), so they get seeded, stable mock numbers.
  Every mock response is explicitly flagged `is_mock_data: true` —
  never silently presented as real.
- **Normalization service** (`platform_analytics_service.py`): builds
  YouTube's snapshot from actual `Content`/`AudienceGrowth` DB records,
  falls back to the mock service for the other two. All comparison,
  summary, and chart-data functions work identically regardless of
  which platforms are real vs mocked.
- Endpoints: `/platforms/summary` (cross-platform KPIs),
  `/platforms/comparison` (full snapshot per platform),
  `/platforms/growth-comparison`, `/platforms/engagement-comparison`,
  `/platforms/{platform}` (single snapshot).
- No API keys hardcoded anywhere — mock data needs none, and Sprint 5's
  real YouTube key will come from `.env` like everything else.

### Frontend
- Platform Comparison page: cross-platform KPI cards, growth-rate and
  engagement-rate bar charts (one bar per platform), and a breakdown
  table with a **Live / Simulated** badge per row so it's always clear
  which numbers are real.

### A real bug this sprint caught (in Sprint 3's code)
Building `get_platform_snapshot()` for YouTube, I reused
`audience_service.get_growth_summary()` to get "current followers" —
but that function only looks at records *within the requested day
window* (default 30 days). A creator whose only growth record was
posted outside that window got `followers: 0` even though a real
follower count existed. This bug was already live in Sprint 3's
`/audience/growth/summary` endpoint; Sprint 4's test suite is what
surfaced it (a test used a January date against a "today" of September).

**Fix**: added `get_current_followers()` — the true latest recorded
count, independent of any day-window filter — and made `get_growth_summary`
use it as the followers figure, only using the windowed records for the
growth-rate math. Verified by re-running Sprint 3's own tests after the
change (still 100% pass) plus new Sprint 4 tests that specifically
exercise old dates. Full suite: **40/40 passing**.

## Known limitations
- Mock data uses a fixed random seed per platform, so numbers are
  stable within and across runs, but they're not meant to look
  realistic in any deeper sense — they're consciously fake placeholder
  data until a real integration replaces them.
- Only YouTube can have real data right now; Instagram/TikTok real
  integrations are out of scope for this project's current sprint plan
  (only YouTube integration is specified, in Sprint 5).

## How to verify
```bash
cd backend && pytest tests/ -v   # 40 passed
cd frontend && npm run build     # builds clean
```
Visit `/analytics/platforms` after logging in — works immediately with
zero setup, since Instagram/TikTok are always mocked and YouTube
gracefully shows zeros with no data entered yet.
