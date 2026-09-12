# Sprint 7 — Notifications, Reporting & Exportable Reports

## Goal
Add a notification/alert system and a reporting layer that combines
every prior sprint's analytics into a single structured report,
exportable as PDF and Excel — reusing existing services rather than
recomputing analytics.

## What was built

### Notifications
- `Notification` model: `notification_type` (performance/engagement/revenue),
  title, message, `is_read`, timestamp — one table for all three alert
  categories rather than three near-identical tables, since they share
  the same shape and differ only in category.
- CRUD + read/unread status endpoints, all scoped to the logged-in
  creator via the existing `get_current_user` dependency — the same
  authorization pattern used everywhere else in the project.
- **Alert generation reuses existing services, never recomputes**:
  `generate_engagement_alerts()` calls `content_service.get_kpi_summary()`
  (Sprint 2) and reacts to its output; `generate_revenue_alerts()` calls
  `revenue_service.get_revenue_kpi_summary()` (Sprint 6). A test asserts
  the alert message's number is byte-identical to what the original
  Sprint 2 endpoint reports, proving reuse rather than parallel logic
  that could silently drift out of sync.

### Reporting
- `report_service.generate_creator_report()` computes nothing itself —
  it calls `content_service`, `audience_service`,
  `platform_analytics_service`, and `revenue_service` functions
  (already built in Sprints 2, 3, 4, 6) and assembles their results into
  one structured dict. Tests directly compare report sections against
  the original standalone endpoints to prove this.
- `GET /api/reports/creator` — JSON report with content, audience,
  revenue, growth, and platform-comparison sections.
- `GET /api/reports/creator/pdf` and `.../excel` — same data as
  downloadable files.
- **No `creator_id` parameter anywhere** — every report route calls
  `generate_creator_report(db, current_user)`, so a creator can only
  ever generate their own report. This isn't an authorization check
  that could be forgotten on some code path; it's structurally
  impossible to request another creator's report through this API.

### PDF export (`pdf_report_service.py`)
Built with reportlab (Platypus + Table), covering KPI summary, content
performance, audience analytics, revenue trend, growth by platform, and
platform comparison — with real backend data in every table, no
hardcoded values. Verified by generating a real PDF from real seeded
data and extracting its text to confirm the numbers matched exactly
what was stored (see Testing below).

### Excel export (`excel_report_service.py`)
Built with openpyxl, six sheets: Summary, Content Performance, Audience
Analytics, Revenue, Growth Trends, Platform Comparison.

**A real bug caught by actually opening the generated file, not just
checking the HTTP status**: the platform/growth sheets initially wrote
raw `Platform` enum objects directly into cells, which openpyxl
serializes via `str()` — producing `"Platform.youtube"` instead of
`"youtube"`. The PDF version happened to avoid this by accident (it
called `.capitalize()`, which works differently on a `str`-subclass
Enum than plain `str()` does). Fixed with an explicit `_enum_value()`
helper used everywhere an enum could reach a cell, and added a
regression test (`test_excel_report_platform_values_are_plain_strings_not_enum_repr`)
that specifically checks for the `"Platform."` prefix bug pattern.

### Error handling
- Missing/invalid auth → `401` (existing `get_current_user` behavior,
  unchanged).
- Database errors during report assembly → caught and returned as a
  clean `500` with a message, not a raw stack trace.
- PDF/Excel generation failures → caught separately from the data-
  fetch step, so a rendering bug is distinguishable from a DB error.
- Empty state (no content/revenue/audience data yet) → reports and
  exports still generate successfully with zeroed sections, verified
  by tests — this was a deliberate design point, not an afterthought,
  since a new creator's first report shouldn't error just because
  they haven't entered data yet.

## Database / Alembic
- New table: `notifications` only.
- Migration `8b7fea28861a` (depends on `d9f3851149b0`, the Sprint 1–6
  migration) — additive only, does not touch any existing table.
- **A real bug caught before it shipped**: the first `--autogenerate`
  attempt produced an empty migration (`pass` in both `upgrade()` and
  `downgrade()`) because `alembic/env.py` had never been updated to
  import the new `notification` model — autogenerate can only diff
  against tables it knows about. Fixed by adding the import and
  regenerating; the corrected migration correctly detected the new
  table and its two indexes.
- **Verified, not assumed, that existing data survives**: applied the
  Sprint 1–6 migration to a throwaway database, inserted a real user
  row, then applied the Sprint 7 migration on top, and confirmed both
  the `notifications` table appeared AND the pre-existing user row was
  untouched. Also verified `downgrade` removes only `notifications` and
  leaves every other table and its data intact.

## Testing
27 new tests in `tests/test_reports.py`, covering: notification CRUD,
read/unread status and counts, type filtering, creator isolation, alert
generation for all three categories (including a no-data case that
must not error), report structure and section-by-section equivalence
with the original Sprint 2/6 endpoints, PDF/Excel generation with and
without data, real PDF file-signature and Excel sheet-name checks, a
value-accuracy check against actually-stored data, the enum-serialization
regression test described above, and auth requirements on every new
route.

Full suite (Sprints 1–7 combined): **94/94 passing**. Existing Sprint
1–6 tests were re-run unchanged and still pass, confirming nothing was
broken.

## Known limitations
- Alert thresholds (`LOW_ENGAGEMENT_THRESHOLD_PERCENT`, etc.) are
  simple fixed constants, not personalized or ML-driven — reasonable
  for the spec's scope, easy to tune later since they're named
  constants in one place, not magic numbers scattered through the code.
- No notification delivery beyond in-app (no email/push) — out of
  scope per the spec, which only asks for the notification system and
  its APIs.
- Reports are generated fresh on every request, not cached — fine at
  this data scale; would need caching if report generation ever became
  a bottleneck for a creator with a very large content history.

## How to run
```bash
cd backend
python -m venv venv && source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env   # if not already done
alembic upgrade head   # applies Sprint 7's notifications table
uvicorn app.main:app --reload
```

```bash
cd frontend
npm install
npm run dev
```

## How to test
```bash
cd backend
pytest tests/ -v                    # full suite, 94 passed
pytest tests/test_reports.py -v     # Sprint 7 only, 27 passed
```

## Swagger endpoints to test manually
At `http://localhost:8000/docs`, after logging in via `/api/auth/login`
and authorizing with the returned token:
- `POST /api/notifications/generate` — creates alerts from your current data
- `GET /api/notifications/` — list, with `unread_only` and `notification_type` filters
- `PATCH /api/notifications/{id}/read` — toggle read status
- `GET /api/reports/creator` — full JSON report
- `GET /api/reports/creator/pdf` — downloads a PDF (Swagger's "Download file" link)
- `GET /api/reports/creator/excel` — downloads an .xlsx file
