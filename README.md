# 📊 Creator Analytics & Content Performance Dashboard

A high-performance FastAPI backend designed for content creators, agencies, and social media managers to track, analyze, and compare content metrics across multiple platforms.

---

## 🌟 Key Features

### 🔐 1. Authentication & Security Module
* **OAuth2 with Password Bearer**: Standard protocol for token-based authentication.
* **JWT Access Tokens**: Token generation, signing, and expiration handling with `PyJWT`.
* **Password Hashing**: Secure password encryption using `Passlib` and `Bcrypt`.

### 📊 2. Content Analytics Module
* **Performance Tracking**: Monitor core metrics including Views, Likes, Comments, Shares, Saves, Watch Time, and Reach.
* **Engagement Health Monitoring**: Real-time aggregation of total engagements and average engagement rates.
* **Side-by-Side Content Comparison**: Compare metrics across multiple posts or platforms simultaneously.
* **Top-Performing Content Reports**: Rank and generate reports based on chosen metrics (e.g., Highest Engagement, Top Views).
* **Reach & Trend Analysis**: Analyze post reach distributions and track performance trends over time.

### 📺 3. YouTube API Integration
* **Live Video Import**: Instantly fetch real-time public video metrics (views, likes, comments, title) using the YouTube Data API v3.
* **Automated Sync**: Seamlessly maps external YouTube data directly into your analytics engine.

---

## 🛠️ Tech Stack

| Category | Technology / Library |
| :--- | :--- |
| **Language** | Python 3.x |
| **Framework** | FastAPI |
| **Server** | Uvicorn / FastAPI CLI |
| **Database Driver** | PostgreSQL (`psycopg2-binary`) |
| **Data Validation** | Pydantic |
| **Security & Auth** | PyJWT, Passlib (Bcrypt), OAuth2 |
| **API Integration** | Google API Python Client (`google-api-python-client`) |
| **Config Management** | `python-dotenv` |

---

## 📐 Engagement Rate Formula

The engine automatically calculates engagement rates using the following standard equation:

$$\text{Engagement Rate} = \left( \frac{\text{Likes} + \text{Comments} + \text{Shares} + \text{Saves}}{\text{Reach}} \right) \times 100$$

---

## 📂 Project Structure

```text
creatoriq/
├── app/
│   ├── core/
│   │   ├── auth.py              # JWT & authentication dependencies
│   │   └── security.py          # Password hashing functions
│   ├── routers/
│   │   ├── auth.py              # Login & registration endpoints
│   │   ├── content_analytics.py # Performance, comparison & reporting endpoints
│   │   └── youtube.py           # YouTube API sync endpoints
│   ├── schemas/
│   │   ├── user.py              # User Pydantic models
│   │   └── content_analytics.py # Metrics & request/response schemas
│   ├── services/
│   │   └── youtube_service.py   # YouTube Data API v3 integration
│   └── main.py                  # FastAPI application entry point
├── .env                         # Environment variables (Git-ignored)
├── .gitignore                   # Files excluded from version control
└── README.md                    # Project documentation