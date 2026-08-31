# 📊 Creator Analytics & Content Performance Dashboard

A high-performance FastAPI backend designed for content creators, agencies, and social media managers to track, analyze, and store content metrics across multiple platforms.

---

## 🧭 Platform Architecture Summary

The project follows a reusable social-sync architecture:

- YouTube-specific logic lives in the YouTube API client and transformation code in `app/services/youtube_service.py`. It handles Google-specific auth, search parameters, video metadata, and public metrics parsing.
- Shared platform-agnostic logic stays in the central data model (`app/models/content.py`), the analytics layer (`app/services/analytics_service.py`), and the dashboard APIs (`app/routers/analytics.py`). These components operate on the common content contract, not on YouTube-only fields.
- The additional platform implemented for this sprint is Instagram, represented by `app/services/instagram_service.py`. It follows the same pipeline as YouTube: fetch -> transform -> validate -> store -> analytics.
- Generic pieces that must not be duplicated for a third platform are the SQLAlchemy content table, KPI aggregation, platform filtering, and the React dashboard’s shared selector/comparison logic.

### Common CreatorIQ content record contract

Every platform sync writes to the same shared record shape used by the dashboard and analytics layer:

- `platform`
- `content_id`
- `content_title`
- `views`
- `likes`
- `comments`
- `shares`
- `reach`
- `published_date`

When a platform does not expose a metric, the service stores `null`/`None` instead of fabricating a value or silently defaulting to zero.

## 🌟 Key Features

### 📦 1. Content Analytics Engine

* **PostgreSQL & SQLAlchemy Integration**: Object-Relational Mapping (ORM) structure for persistent storage of multi-platform content metrics.
* **Full CRUD Operations**: Endpoints to create (single & bulk), fetch, update, and soft/hard delete content items.
* **Strict Pydantic Validation**: Guardrails preventing negative values for view counts, likes, watch time, etc., and enforcing title length rules.
* **Multi-Platform Support**: Store standardized analytics across platforms including YouTube, Instagram, LinkedIn, TikTok, and Twitter.

### 🔐 2. Authentication & Security Module

* **OAuth2 with Password Bearer**: Standard protocol for token-based authentication.
* **JWT Access Tokens**: Token generation, signing, and expiration handling with `PyJWT`.
* **Password Hashing**: Secure password encryption using `Passlib` and `Bcrypt`.

### 📺 3. YouTube API Integration

* **Live Video Import**: Instantly fetch real-time public video metrics (views, likes, comments, title) using the YouTube Data API v3.
* **Secure Key Management**: Loads API keys dynamically from environment configuration (`.env`).

### 🌐 4. Multi-Platform Social Sync

* **Reusable Common Data Model**: Content records are standardized around shared fields such as `platform`, `content_id`, `content_title`, `views`, `likes`, `comments`, `shares`, `reach`, and `published_date`.
* **Instagram Integration**: Adds an additional platform service alongside YouTube using the same CreatorIQ data pipeline.
* **Platform-Aware Analytics**: KPI and comparison endpoints support filtering by `All`, `YouTube`, and `Instagram` without duplicating analytics code.
* **Duplicate Protection**: Synchronization checks existing creator + platform + content records before inserting duplicates.
* **Unavailable metrics**: metrics missing from the source API are stored as `None` instead of synthetic values.

### 📸 5. Instagram Sprint Integration

This repository uses Instagram as the additional platform for the first multi-platform expansion. The sync path is:

`Instagram Graph API -> fetch -> normalize -> validate -> PostgreSQL -> analytics -> dashboard`

Required setup:

1. Create a Facebook developer app and an Instagram business account with Graph API access.
2. Generate a long-lived access token with `instagram_basic` and `instagram_manage_insights` permissions.
3. Set the account ID and access token in your environment or request payload.
4. Trigger the sync endpoint for `Instagram` to import recent media and statistics.

### 🔁 Adding a future third platform

To add another provider such as TikTok or Facebook, follow the same pattern:

1. Create a service module under `app/services/` for the new platform.
2. Add a dedicated API client/auth layer for that provider.
3. Transform responses into the shared CreatorIQ content record shape.
4. Validate metric availability; use `None` when a field is not exposed.
5. Upsert records by `creator_id + platform + content_id`.
6. Reuse the existing analytics service and dashboard filters; only the platform selector and API auth are platform-specific.

---

## 🛠️ Tech Stack

| Category | Technology / Library |
| --- | --- |
| **Language** | Python 3.10+ |
| **Framework** | FastAPI |
| **Server** | Uvicorn / FastAPI CLI |
| **Database** | PostgreSQL |
| **ORM Engine** | SQLAlchemy |
| **Data Validation** | Pydantic v2 |
| **Security & Auth** | PyJWT, Passlib (Bcrypt), OAuth2 |
| **API Integration** | Google API Python Client (`google-api-python-client`) |
| **Config Management** | `python-dotenv` |

---

## 📐 Engagement Rate Formula

The analytics engine calculates engagement performance using the following standard equation:

$$\text{Engagement Rate} = \left( \frac{\text{Likes} + \text{Comments} + \text{Shares} + \text{Saves}}{\text{Reach}} \right) \times 100$$

---

## 📂 Project Structure

```text
creatoriq/
├── app/
│   ├── db/
│   │   └── database.py          # SQLAlchemy engine, SessionLocal & Base configuration
│   ├── models/
│   │   └── content.py           # SQLAlchemy Content ORM database model
│   ├── schemas/
│   │   ├── user.py              # User Pydantic schemas
│   │   └── content.py           # Content validation, create, update & response schemas
│   ├── routers/
│   │   ├── auth.py              # Authentication endpoints
│   │   ├── content.py           # Content Analytics CRUD API endpoints
│   │   └── youtube.py           # YouTube API synchronization endpoints
│   ├── services/
│   │   └── youtube_service.py   # YouTube Data API v3 service integration
│   └── main.py                  # FastAPI entry point & database initialization
├── .env                         # Environment variables (Database URL, API Keys)
├── .gitignore                   # Excluded files (venv, .env, __pycache__)
├── requirements.txt             # Project dependencies
└── README.md                    # Project documentation

```

---

## � Multi-Platform Sprint Flow

CreatorIQ now follows a reusable social sync pipeline:

```text
Social API -> Fetch Data -> Transform to common format -> Validate metrics -> Store in PostgreSQL -> Analytics & Dashboard
```

### Supported Sprint Platforms

- YouTube (reference implementation)
- Instagram (added platform integration)
- Shared filtering and comparison logic for future platform additions

### Common Content Contract

Each synchronized post/video is stored in the common content shape used across the dashboard:

- `platform`
- `external_content_id`
- `content_title`
- `views`
- `likes`
- `comments`
- `shares`
- `saves`
- `reach`
- `published_date`

---

## �🚀 API Endpoints Overview

### Content Analytics (`/content`)

| Method | Endpoint | Description | Status Code |
| --- | --- | --- | --- |
| `POST` | `/content/` | Create a single content item record | `201 Created` |
| `POST` | `/content/bulk` | Bulk insert multiple content items at once | `201 Created` |
| `GET` | `/content/` | Fetch all content records | `200 OK` |
| `GET` | `/content/{id}` | Fetch a specific content item by ID | `200 OK` / `404 Not Found` |
| `PUT` | `/content/{id}` | Update existing content details or metrics | `200 OK` / `404 Not Found` |
| `DELETE` | `/content/{id}` | Remove a content record by ID | `204 No Content` / `404 Not Found` |

---

## ⚙️ Local Setup & Installation Guide

### 1. Clone the Repository

```bash
git clone https://github.com/springboardmentor330h/Creator-Analytics-Content-Performance-Dashboard.git
cd Creator-Analytics-Content-Performance-Dashboard

```

### 2. Create & Activate Virtual Environment

```bash
# macOS/Linux
python3 -m venv venv
source venv/bin/activate

# Windows
python -m venv venv
venv\Scripts\activate

```

### 3. Install Dependencies

```bash
pip install -r requirements.txt

```

### 4. Configure Environment Variables (`.env`)

Create a `.env` file in the root directory:

```env
DATABASE_URL=postgresql://postgres:your_password@localhost:5432/creatoriq_db
YOUTUBE_API_KEY=your_actual_youtube_api_key_here
SECRET_KEY=your_jwt_secret_key_here

```

### 5. Run the Backend Server

```bash
uvicorn app.main:app --reload

```

### 6. Run the Frontend Dashboard

```bash
cd frontend
npm install
npm run dev -- --host 0.0.0.0 --port 4173
```

### 7. Test via Interactive API Docs

Open your browser and navigate to:

* **Swagger UI:** `[http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)`
* **ReDoc:** `[http://127.0.0.1:8000/redoc](http://127.0.0.1:8000/redoc)`