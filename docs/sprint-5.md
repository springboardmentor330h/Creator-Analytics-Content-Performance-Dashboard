# Sprint 5 — YouTube API Integration

## Goal
Replace mock YouTube data with a real integration: pull a creator's
actual channel stats and recent video performance from the YouTube
Data API v3, and store it in the internal Content/AudienceGrowth
tables so it flows through every analytics feature built in Sprints 2–4
without those features needing to change.

## What was built

### Backend
- **`youtube_service.py`** — the only file that knows YouTube's specific
  URL structure and response shape. Three calls: `channels.list` (channel
  info + subscriber count), `playlistItems.list` (recent video IDs from
  the uploads playlist), `videos.list` (per-video stats, batched up to
  50 IDs per call to conserve API quota).
- Auth is a plain API key (query param) — correct for reading *public*
  channel/video data, which is all this needs. OAuth would only be
  required to read a channel's *private* analytics or post on its
  behalf, which the spec doesn't ask for.
- **`sync_service.py`** — transforms YouTube's response shape into our
  `Content`/`AudienceGrowth` rows, and handles duplicates:
  - Added a new `Content.external_id` column (nullable — doesn't affect
    Sprint 2's manual-entry flow) storing the YouTube video ID, so
    re-syncing the same channel **updates** existing rows instead of
    creating duplicates every time.
  - Growth records are one-per-day: re-syncing the same day updates
    that day's follower count rather than inserting a second row.
- `POST /api/youtube/sync` — protected, returns a summary (`videos_synced`,
  `videos_updated`, channel info) so a failed/partial sync is debuggable,
  not a silent black box.
- Returns `503` cleanly if `YOUTUBE_API_KEY` isn't set — never crashes
  with an unhandled exception from a missing key.
- **Never commits secrets**: the key lives only in `.env` (gitignored),
  read via `settings.YOUTUBE_API_KEY`, same pattern as `SECRET_KEY`.

### A real gap the API forced me to confront, documented not hidden
YouTube's public API does **not** expose `reach`, `impressions`, `shares`,
or `saves` for videos you don't own (that data requires the separate,
OAuth-gated YouTube Analytics API — out of scope per the spec, which
only asks for the Data API). Rather than silently leaving those fields
at `0` — which would make every synced video show `0%` engagement rate,
quietly breaking Sprint 2's analytics for anyone using real sync data —
`sync_service.py` uses `view_count` as a `reach` proxy, with a comment
explaining exactly why and what the real limitation is. `shares`/`saves`
stay `0` since there's no reasonable proxy for those.

### Frontend
- A "Sync YouTube Channel" card on the Dashboard: enter a channel ID,
  trigger a sync, see a summary (subscriber count, videos added/updated).

### Testing — what's real vs mocked, explicitly
**All HTTP calls to YouTube are mocked in the test suite.** This is
standard practice for third-party integrations, not a shortcut: hitting
the real API in automated tests would need a real key checked into CI,
burn daily quota on every test run, and make tests flaky whenever
YouTube has a hiccup. What the 10 new tests verify instead — and what
our code is actually responsible for — is real: request construction,
response parsing, error handling (channel not found, bad API key, non-200
status), the batch-size limit, and — most importantly — the **idempotent
sync logic**: re-syncing the same channel twice creates zero duplicates
(verified by asserting `total == 2` after two syncs, not 4).

**What is NOT verified by the automated tests**: whether YouTube's real
API still returns exactly this JSON shape. See "Verifying against the
real API" below — that's on you to run once, with your own key.

Full suite: **50/50 passing**.

## Verifying against the real API
1. Get a free API key: console.cloud.google.com → create/select a
   project → enable "YouTube Data API v3" → Credentials → Create API Key.
2. Put it in `backend/.env` as `YOUTUBE_API_KEY=your-key-here`.
3. Start the backend, log in, and call:
   ```
   POST /api/youtube/sync
   { "channel_id": "UCX6OQ3DkcsbYNE6H8uQQuVA" }
   ```
   (that ID is a real, well-known channel — safe to test against).
4. Check `GET /api/content/` — you should see real synced videos.
5. Run the sync a second time with the same channel ID — `total` in
   `/api/content/` should NOT double. If it does, that's a real bug,
   not something the mocked tests would have caught, so this manual
   check matters.

## Known limitations
- `reach` is a view-count proxy for synced content, not real reach —
  documented above and in code comments. Manual content entry (Sprint 2)
  is unaffected; this only applies to YouTube-synced videos.
- No scheduled/automatic sync — a creator must trigger it manually via
  the dashboard button. Scheduled background sync wasn't in the spec.
- Only fetches the most recent 25 videos per sync (one `playlistItems`
  page) — full channel backfill via pagination wasn't requested.

## How to verify
```bash
cd backend && pytest tests/ -v   # 50 passed (all mocked, no key needed)
cd frontend && npm run build     # builds clean
```
For a real-API check, follow "Verifying against the real API" above.
