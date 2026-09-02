# Sprint 3 — Audience & Growth Analytics

## Goal
Track who a creator's audience is (demographics) and how it's changing
over time (follower growth), with analytics APIs and a dashboard.

## What was built

### Backend
- **Two separate tables**, deliberately: `AudienceDemographic` (a
  snapshot of age/gender/country splits at a point in time) and
  `AudienceGrowth` (a follower count at a point in time). They're kept
  apart because demographics have several sub-fields per record while
  growth is a single number per day — merging them would mean mostly
  empty columns either way, and they answer different questions
  ("who" vs "how many, over time").
- Age, gender, and geographic breakdowns — computed by averaging
  `percentage` across all recorded snapshots per group (not just the
  latest snapshot), which smooths out noise from any single report.
- Growth rate formula: `(end - start) / start * 100` over a requested
  day window. Guarded against `start == 0` (a brand-new channel's first
  data point) — returns `0.0%` instead of crashing on a real edge case,
  same defensive pattern as the Sprint 2 engagement-rate divide-by-zero.
- Cross-platform KPI summary: sums the *latest* follower count per
  platform (not all records — that would double-count history).
- All endpoints scoped to the logged-in creator, verified by a
  creator-isolation test (creator B never sees creator A's growth data).

### Frontend
- Audience Analytics page: KPI cards, a follower-growth line chart, an
  age-distribution bar chart, a gender-split pie chart, and a top-countries
  table.

### Testing
13 new tests, covering: demographic creation and validation bounds,
breakdown averaging math, empty-state handling (no data yet ≠ error),
growth-rate calculation and its zero-start edge case, 404 on missing
growth data, and creator data isolation. Full suite: **28/28 passing**.

## Known limitations
- Demographic breakdowns average across *all* historical snapshots
  rather than weighting toward the most recent one. Fine while data
  volume is low; a creator with months of snapshots might want a
  "latest snapshot only" or time-weighted view — not built yet, since
  the spec didn't call for it and it's easy to add later without
  breaking the API shape.
- No demographic data seeding/import from a real platform yet — that
  arrives with the real YouTube integration in Sprint 5.

## How to verify
```bash
cd backend && pytest tests/ -v   # 28 passed
cd frontend && npm run build     # builds clean
```
Visit `/analytics/audience` after logging in. Empty until you `POST`
some demographic and growth records via `/docs`.
