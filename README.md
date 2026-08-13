Below is a **README you can paste directly into your project's `README.md`**. It covers the flow from authentication/login through Content APIs and the Analytics APIs you've described.

# Creator Analytics & Content Performance Dashboard

A FastAPI-based backend for managing creator content and generating analytics such as engagement rate, top-performing content, platform performance, and dashboard summaries.

---

## 1. Tech Stack

* Python 3.9+
* FastAPI
* PostgreSQL
* SQLAlchemy
* Pydantic
* Swagger / OpenAPI
* pgAdmin
* Uvicorn

---

## 2. Run the Backend

From the project root:

```bash
py -3.9 -m uvicorn backend.app.main:app --reload
```

Backend:

```text
http://127.0.0.1:8000
```

Swagger:

```text
http://127.0.0.1:8000/docs
```

ReDoc:

```text
http://127.0.0.1:8000/redoc
```

---

# 3. API Overview

| #  | Method | Endpoint                             | Purpose                    |
| -- | ------ | ------------------------------------ | -------------------------- |
| 1  | POST   | `/auth/register`                     | Register a user            |
| 2  | POST   | `/auth/login`                        | Login                      |
| 3  | GET    | `/content`                           | Get all content            |
| 4  | POST   | `/content`                           | Create content             |
| 5  | GET    | `/content/{id}`                      | Get content by ID          |
| 6  | PUT    | `/content/{id}`                      | Update content             |
| 7  | DELETE | `/content/{id}`                      | Delete content             |
| 8  | GET    | `/analytics/content/{id}/engagement` | Calculate engagement       |
| 9  | GET    | `/analytics/top-content`             | Get top-performing content |
| 10 | GET    | `/analytics/platform-performance`    | Compare platforms          |
| 11 | GET    | `/analytics/summary`                 | Dashboard summary          |


# 4. Authentication APIs

## 4.1 Register User

### Request

```http
POST /auth/register
```

### Body

```json
{
  "username": "revanth",
  "email": "revanth@example.com",
  "password": "Password123"
}
```

### Expected Response

```http
201 Created
```

```json
{
  "id": 1,
  "username": "revanth",
  "email": "revanth@example.com"
}
```

---

# 5. Login

## POST `/auth/login`

Authenticates a user and returns an authentication token if JWT authentication is implemented.

### Request

```http
POST /auth/login
```

### Body

```json
{
  "username": "revanth",
  "password": "Password123"
}
```

### Expected Response

```http
200 OK
```

Example:

```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIs...",
  "token_type": "bearer"
}
```

If your API uses OAuth2 form login instead of JSON, Swagger may show:

```text
username
password
```

as form fields instead.

---

# 6. Content APIs

Content APIs manage creator content and performance metrics.

## Content Object

A typical content object contains:

```json
{
  "creator_id": 1,
  "platform": "YouTube",
  "content_title": "They Call Him OG - Firestorm Lyric Video",
  "views": 74484217,
  "likes": 1219934,
  "comments": 46679,
  "shares": 0,
  "saves": 0,
  "watch_time": 0,
  "reach": 74484217,
  "published_date": "2025-08-02"
}
```

---

# 7. Create Content

## POST `/content`

Creates a single content record.

### Request Body

```json
{
  "creator_id": 1,
  "platform": "YouTube",
  "content_title": "They Call Him OG - Firestorm Lyric Video",
  "views": 74484217,
  "likes": 1219934,
  "comments": 46679,
  "shares": 0,
  "saves": 0,
  "watch_time": 0,
  "reach": 74484217,
  "published_date": "2025-08-02"
}
```

### Success

```http
201 Created
```

### Response

```json
{
  "id": 1,
  "creator_id": 1,
  "platform": "YouTube",
  "content_title": "They Call Him OG - Firestorm Lyric Video",
  "views": 74484217,
  "likes": 1219934,
  "comments": 46679,
  "shares": 0,
  "saves": 0,
  "watch_time": 0,
  "reach": 74484217,
  "published_date": "2025-08-02"
}
```

---

# 8. Create Multiple Content Records

If a bulk endpoint has been implemented:

## POST `/content/bulk`

Creates multiple content records in one request.

### Request Body

```json
[
  {
    "creator_id": 1,
    "platform": "YouTube",
    "content_title": "They Call Him OG - Firestorm",
    "views": 74484217,
    "likes": 1219934,
    "comments": 46679,
    "shares": 0,
    "saves": 0,
    "watch_time": 0,
    "reach": 74484217,
    "published_date": "2025-08-02"
  },
  {
    "creator_id": 1,
    "platform": "YouTube",
    "content_title": "They Call Him OG - Streets of Fire",
    "views": 3077384,
    "likes": 60560,
    "comments": 979,
    "shares": 0,
    "saves": 0,
    "watch_time": 0,
    "reach": 3077384,
    "published_date": "2025-09-01"
  }
]
```

### Success

```http
201 Created
```

### Response

```json
[
  {
    "id": 1,
    "content_title": "They Call Him OG - Firestorm"
  },
  {
    "id": 2,
    "content_title": "They Call Him OG - Streets of Fire"
  }
]
```

> If `/content/bulk` is not implemented, use `POST /content` one record at a time.

---

# 9. Get All Content

## GET `/content`

Returns all content records.

### Request

```http
GET /content
```

### Success

```http
200 OK
```

### Response

```json
[
  {
    "id": 1,
    "creator_id": 1,
    "platform": "YouTube",
    "content_title": "They Call Him OG - Firestorm",
    "views": 74484217,
    "likes": 1219934,
    "comments": 46679,
    "shares": 0,
    "saves": 0,
    "watch_time": 0,
    "reach": 74484217,
    "published_date": "2025-08-02"
  }
]
```

---

# 10. Get Content by ID

## GET `/content/{id}`

Returns one content record.

### Example

```http
GET /content/1
```

### Success

```http
200 OK
```

### Response

```json
{
  "id": 1,
  "creator_id": 1,
  "platform": "YouTube",
  "content_title": "They Call Him OG - Firestorm",
  "views": 74484217,
  "likes": 1219934,
  "comments": 46679,
  "shares": 0,
  "saves": 0,
  "watch_time": 0,
  "reach": 74484217,
  "published_date": "2025-08-02"
}
```

### Not Found

```http
404 Not Found
```

```json
{
  "detail": "Content not found"
}
```

---

# 11. Update Content

## PUT `/content/{id}`

Updates an existing content record.

### Example

```http
PUT /content/1
```

### Request Body

```json
{
  "content_title": "They Call Him OG - Firestorm Lyric Video",
  "views": 75000000,
  "likes": 1220000
}
```

### Success

```http
200 OK
```

### Response

```json
{
  "id": 1,
  "content_title": "They Call Him OG - Firestorm Lyric Video",
  "views": 75000000,
  "likes": 1220000
}
```

### Not Found

```http
404 Not Found
```

---

# 12. Delete Content

## DELETE `/content/{id}`

Deletes a content record.

### Example

```http
DELETE /content/1
```

### Success

```http
200 OK
```

### Response

```json
{
  "message": "Content deleted successfully"
}
```

### Not Found

```http
404 Not Found
```

```json
{
  "detail": "Content not found"
}
```

---

# 13. Validation

The Content API validates incoming data.

## Short Content Title

A title shorter than 3 characters should fail.

### Example

```json
{
  "creator_id": 1,
  "platform": "YouTube",
  "content_title": "OG",
  "views": 1000,
  "likes": 100,
  "comments": 20,
  "shares": 10,
  "saves": 5,
  "watch_time": 500,
  "reach": 1500,
  "published_date": "2025-08-02"
}
```

Expected:

```http
422 Unprocessable Entity
```

## Negative Metrics

Example:

```json
{
  "views": -100
}
```

Expected:

```http
422 Unprocessable Entity
```

---

# 14. Analytics APIs

Analytics APIs calculate performance metrics from the `contents` table.

---

# 15. Content Engagement

## GET `/analytics/content/{id}/engagement`

Calculates engagement for a specific content item.

### Example

```http
GET /analytics/content/1/engagement
```

### Formula

```text
Total Engagement =
Likes + Comments + Shares + Saves
```

```text
Engagement Rate =
(Total Engagement / Reach) × 100
```

### Success

```http
200 OK
```

### Response

```json
{
  "content_id": 1,
  "platform": "YouTube",
  "views": 74484217,
  "reach": 74484217,
  "total_engagement": 1306613,
  "engagement_rate": 1.75
}
```

### Not Found

```http
404 Not Found
```

```json
{
  "detail": "Content not found"
}
```

---

# 16. Top Performing Content

## GET `/analytics/top-content`

Returns content sorted by engagement rate.

### Default

```http
GET /analytics/top-content
```

Default limit:

```text
5
```

### Custom Limit

```http
GET /analytics/top-content?limit=10
```

### Response

```json
[
  {
    "content_id": 1,
    "content_title": "They Call Him OG - Firestorm",
    "platform": "YouTube",
    "views": 74484217,
    "reach": 74484217,
    "watch_time": 0,
    "engagement_rate": 1.75
  },
  {
    "content_id": 2,
    "content_title": "They Call Him OG - Streets of Fire",
    "platform": "YouTube",
    "views": 3077384,
    "reach": 3077384,
    "watch_time": 0,
    "engagement_rate": 2.05
  }
]
```

---

# 17. Platform Performance

## GET `/analytics/platform-performance`

Returns aggregated performance by platform.

### Request

```http
GET /analytics/platform-performance
```

### Response

```json
[
  {
    "platform": "YouTube",
    "total_views": 85000000,
    "total_likes": 1400000,
    "total_comments": 50000,
    "total_reach": 90000000,
    "average_engagement_rate": 2.15
  }
]
```

If Instagram, LinkedIn, or other platform records exist, they will appear as separate entries.

---

# 18. Dashboard Summary

## GET `/analytics/summary`

Returns the main dashboard-level statistics.

### Request

```http
GET /analytics/summary
```

### Response

```json
{
  "total_content": 10,
  "total_views": 85000000,
  "total_reach": 90000000,
  "average_engagement_rate": 2.15,
  "best_platform": "YouTube",
  "top_content": "They Call Him OG - Firestorm"
}
```

---

# 19. HTTP Status Codes

| Status | Meaning                        |
| ------ | ------------------------------ |
| `200`  | Successful request             |
| `201`  | Resource successfully created  |
| `400`  | Bad request                    |
| `401`  | Authentication required/failed |
| `403`  | Access forbidden               |
| `404`  | Resource not found             |
| `422`  | Validation error               |
| `500`  | Internal server error          |

---

# 20. Database

PostgreSQL is used as the application's database.

Main content table:

```text
contents
```

Typical columns:

```text
id
creator_id
platform
content_title
views
likes
comments
shares
saves
watch_time
reach
published_date
```

---

# 21. Verify Data in pgAdmin

Open pgAdmin:

```text
Servers
  → PostgreSQL
    → Databases
      → creatoriq
        → Schemas
          → public
            → Tables
              → contents
```

Run:

```sql
SELECT * FROM contents;
```

To see the latest records:

```sql
SELECT *
FROM contents
ORDER BY id DESC;
```

---

# 22. API Testing Flow

Recommended testing order:

```text
1. Register
      ↓
2. Login
      ↓
3. Create Content
      ↓
4. Get All Content
      ↓
5. Get Content By ID
      ↓
6. Update Content
      ↓
7. Verify Database
      ↓
8. Engagement Analytics
      ↓
9. Top Content
      ↓
10. Platform Performance
      ↓
11. Dashboard Summary
      ↓
12. Delete Content
```

---

# 23. Swagger Testing

Open:

```text
http://127.0.0.1:8000/docs
```

For every endpoint:

1. Expand the endpoint.
2. Click **Try it out**.
3. Enter the required parameters/body.
4. Click **Execute**.
5. Verify the HTTP status code.
6. Verify the response JSON.

---

# 24. Automated Tests

Run the existing analytics tests:

```bash
py -3.9 -m unittest backend/tests/test_analytics.py
```

The test suite should verify:

* Engagement calculation
* Top content
* Platform performance
* Dashboard summary
* API responses
* Database interaction

---

# 25. YouTube Integration — Planned/Optional

The planned real-data integration can use a YouTube Channel ID rather than requiring individual video IDs.

Proposed flow:

```text
YouTube Channel ID
        ↓
YouTube Data API
        ↓
Get channel information
        ↓
Get uploaded videos
        ↓
Get video statistics
        ↓
FastAPI
        ↓
PostgreSQL
        ↓
Analytics APIs
        ↓
Dashboard
```

A future endpoint could be:

```http
POST /youtube/sync/{channel_id}
```

Example:

```text
POST /youtube/sync/UCxxxxxxxxxxxxxxxx
```

The endpoint can retrieve the latest 10–15 videos and create/update the corresponding records in the `contents` table.

---

# 26. Project Architecture

```text
Creator-Analytics-Content-Performance-Dashboard
│
├── backend/
│   ├── app/
│   │   ├── main.py
│   │   ├── db/
│   │   │   └── database.py
│   │   ├── models/
│   │   ├── schemas/
│   │   ├── routes/
│   │   └── services/
│   │
│   └── tests/
│       └── test_analytics.py
│
├── .env
├── .gitignore
├── requirements.txt
└── README.md
```

---

# 27. End-to-End Data Flow

```text
User
 │
 ▼
Swagger / Frontend
 │
 ▼
FastAPI
 │
 ├── Authentication
 │
 ├── Content APIs
 │
 └── Analytics APIs
 │
 ▼
SQLAlchemy
 │
 ▼
PostgreSQL
 │
 ▼
Analytics Calculations
 │
 ▼
Dashboard
```


## API Base URL

```text
http://127.0.0.1:8000
```

## Swagger

```text
http://127.0.0.1:8000/docs
```

## ReDoc

```text
http://127.0.0.1:8000/redoc
```
