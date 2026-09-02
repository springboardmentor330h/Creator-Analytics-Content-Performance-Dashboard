# Sprint 1 — Foundation

## Goal
Stand up the application skeleton: database, User model, authentication
(register/login with JWT), role-based authorization, and a minimal
protected React dashboard.

## What was built

### Backend
- FastAPI app (`app/main.py`) with CORS enabled for the Vite dev server.
- PostgreSQL connection via SQLAlchemy (`app/db/session.py`).
- Cross-dialect `GUID` type (`app/db/types.py`) so the `User.id` primary
  key works on both PostgreSQL (native UUID) and SQLite (used in tests).
- `User` model: id, name, email, password_hash, role (creator/admin), created_at.
- Pydantic schemas separating DB shape from API shape — `password_hash`
  never appears in any response.
- Password hashing with bcrypt (`app/core/security.py`).
- JWT creation/verification, 24h expiry by default.
- `POST /api/auth/register`, `POST /api/auth/login`.
- `GET /api/users/me`, `PUT /api/users/me` (self-service).
- `GET /api/users/`, `GET /api/users/{id}`, `DELETE /api/users/{id}` (admin-only,
  enforced via `require_admin` dependency).
- Swagger docs auto-generated at `/docs`.
- 5 passing tests covering: registration, duplicate-email rejection,
  login success/failure, and protected-route access with/without a token.

### Frontend
- React + Vite app.
- `AuthProvider`/`useAuth` context: holds the logged-in user, restores
  session from a stored JWT on page refresh.
- Axios instance (`services/api.js`) that auto-attaches the JWT and
  force-logs-out on a 401 response.
- Login and Register pages with inline error display.
- `ProtectedRoute` wrapper — redirects to `/login` if not authenticated.
- Sidebar navigation + a minimal Dashboard showing the logged-in user's
  role and email (placeholder KPI cards; real analytics land in Sprint 2).

## Known limitations (by design, for this sprint)
- Tables are created via `Base.metadata.create_all()`, not migrations.
  Alembic is introduced in Sprint 6 once schema changes need to be tracked.
- No password reset / email verification flow — out of scope for Sprint 1.
- Dashboard content is a placeholder; Sprint 2 adds real analytics.

## How to verify locally
1. `docker compose up -d` (starts PostgreSQL)
2. Backend: see `backend/README.md` — install deps, copy `.env.example` to `.env`,
   run `uvicorn app.main:app --reload`, run `pytest`.
3. Frontend: see `frontend/README.md` — `npm install`, `npm run dev`.
4. Visit `http://localhost:5173/register`, create an account, log in,
   confirm the dashboard loads and shows your details.
