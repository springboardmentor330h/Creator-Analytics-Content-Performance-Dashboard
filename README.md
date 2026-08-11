Here is an updated, production-ready **`README.md`** for your repository.

It aligns your project structure with the **SQLAlchemy ORM** database setup (`app/db/` and `app/models/`), documents the **Content Analytics CRUD API** (including single & bulk endpoints), and provides step-by-step setup and running instructions for team members and reviewers.

---

# 📊 Creator Analytics & Content Performance Dashboard

A high-performance FastAPI backend designed for content creators, agencies, and social media managers to track, analyze, and store content metrics across multiple platforms.

---

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

## 🚀 API Endpoints Overview

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

### 5. Run the Server

```bash
uvicorn app.main:app --reload

```

### 6. Test via Interactive API Docs

Open your browser and navigate to:

* **Swagger UI:** `[http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)`
* **ReDoc:** `[http://127.0.0.1:8000/redoc](http://127.0.0.1:8000/redoc)`