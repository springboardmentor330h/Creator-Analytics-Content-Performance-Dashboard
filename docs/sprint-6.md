# Sprint 6 — Revenue & Sponsorship Analytics

## Goal
Track income (ad revenue, affiliate, merchandise, etc.) and brand
sponsorship deals, with monthly/platform/source breakdowns — and
introduce Alembic migrations as the project's real schema-management
tool, replacing ad-hoc `create_all()`.

## What was built

### Backend — Revenue & Sponsorships
- **Two separate models**, deliberately: `Revenue` is a ledger entry
  (money received or expected, on a specific date). `Sponsorship` is a
  relationship with a brand over a campaign lifecycle
  (pending → active → completed), with a date *range*, not a single
  date. A sponsorship can exist before any money has arrived — a
  revenue-only model couldn't represent that "deal signed, not yet
  paid" state, which is exactly why they're not the same table.
- **Pending vs. received is a real accounting distinction, not just a
  status label**: `total_revenue` only sums `status=received` records.
  Counting pending money as already-earned would overstate a creator's
  actual income, so the KPI summary reports `total_revenue` and
  `pending_revenue` separately — verified by a test that adds both a
  received and a pending record and checks they land in the right bucket.
- Monthly trend, revenue-by-platform, revenue-by-type breakdowns.
- Sponsorship status filtering and CRUD, with `end_date` nullable to
  support open-ended/ongoing deals.
- Full creator-isolation and route-ordering test coverage, consistent
  with every prior sprint.

### Backend — Alembic migrations
This is the sprint where the project switches from `Base.metadata.create_all()`
(create tables if missing, fine for early prototyping) to real, versioned
migrations — which is what the spec asks for and what any project touching
production data actually needs.
- `alembic/env.py` wired to import all app models and use the app's own
  `settings.DATABASE_URL`, so migrations and the app never drift onto
  two different schema definitions.
- Generated the initial migration (`d9f3851149b0`) covering every table
  from Sprints 1–6: users, content, audience_demographics, audience_growth,
  revenue, sponsorships.
- **A real bug caught by testing the migration, not just generating it**:
  autogenerate produced a migration referencing our custom `GUID` column
  type but forgot to import it — `NameError: name 'app' is not defined`
  on `alembic upgrade head`. This is a known rough edge with Alembic and
  custom SQLAlchemy types; autogenerate doesn't reliably add imports for
  non-stdlib types. **Fixed by testing both directions**: ran
  `upgrade head` against a throwaway SQLite file (failed, caught the bug,
  fixed the import), then verified `downgrade base` also cleanly tears
  every table back down — a migration that only works one direction
  isn't a trustworthy migration.
- `main.py`'s startup `create_all()` is kept as a no-op safety net for
  local dev convenience and for the test suite (which intentionally
  uses a fast in-memory SQLite DB that never runs migrations) — but the
  README now says clearly that migrations are the real source of truth.

### Frontend
- Revenue dashboard: KPI cards (total/pending revenue, sponsorship
  value, active sponsorship count), a monthly trend line chart, a
  revenue-by-platform bar chart, and two tables (revenue records,
  sponsorships) with inline add-forms and delete buttons. Sponsorship
  status is editable directly from a dropdown in the table.

## Testing
17 new tests: revenue CRUD and validation, the pending/received/cancelled
distinction, monthly-trend grouping, platform/type breakdowns, route
ordering, sponsorship CRUD, status filtering, open-ended (no end_date)
deals, and creator isolation on both resources. Full suite: **67/67 passing**.

The migration itself was verified manually (see above) rather than via
the pytest suite, since the test suite's in-memory SQLite DB is built
via `create_all()` by design — that's a deliberate choice for test
speed, not an oversight, but it does mean migration correctness needed
its own explicit check outside pytest.

## Known limitations
- No multi-currency conversion — `currency` is stored per-record but
  KPI totals sum raw `amount` values regardless of currency. Fine while
  a creator works in one currency; would need real conversion rates to
  aggregate correctly across currencies.
- Sponsorship → Revenue linkage isn't automatic (e.g. marking a
  sponsorship "completed" doesn't auto-create a Revenue record) — the
  spec describes them as separate trackable entities, not a
  cause-and-effect pipeline, so this wasn't built.

## How to verify
```bash
cd backend && pytest tests/ -v        # 67 passed
cd frontend && npm run build          # builds clean
```
To verify migrations against a real Postgres instance:
```bash
docker compose up -d
cd backend
# edit .env to point at the docker-compose postgres if not already
alembic upgrade head
alembic downgrade base   # confirm it tears down cleanly too
alembic upgrade head     # back to current
```
