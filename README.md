# CreatorIQ

A FastAPI-based backend scaffold.


# CreatorIQ

## Project Overview

CreatorIQ is a FastAPI-based backend for managing creator content, analytics, audience insights, growth trends, and social media data.

The project integrates real YouTube API data into the existing CreatorIQ analytics workflow. YouTube content is fetched, transformed into a common CreatorIQ format, stored in PostgreSQL, and made available through existing analytics APIs.

## System Architecture

```text
User
  ↓
FastAPI
  ↓
Routers
  ↓
Services
  ↓
PostgreSQL
  ↓
Analytics APIs
  ↓
Dashboard-ready Data
```

### YouTube Integration Flow

```text
YouTube API
     ↓
YouTube Service
     ↓
Data Transformation
     ↓
PostgreSQL
     ↓
Analytics Service
     ↓
FastAPI Analytics APIs
     ↓
Dashboard
```

## Modules Implemented

### User Management

* User registration
* User login
* Password hashing
* JWT authentication

### Content Analytics

* Content performance
* Engagement analytics
* Content comparison
* Top-performing content
* Reach analysis
* Performance trends

### Audience Analytics

* Audience demographics
* Gender distribution
* Age distribution
* Country and city analysis
* Device distribution
* Audience trends

### Growth Analytics

* Follower growth
* Reach trends
* Engagement-rate trends

### Social Media Integration

* Social platform connection
* Platform listing
* Platform synchronization
* YouTube API integration
* YouTube content synchronization

## Database Tables

The project uses PostgreSQL.

Main tables include:

* `users`
* `content`
* `audience`
* `growth`

The `content` table stores common content information from different social media platforms.

## YouTube API Integration

The YouTube Data API v3 is integrated through:

```text
app/services/youtube_service.py
```

The YouTube service:

* Connects to YouTube Data API v3.
* Authenticates using an API key stored in `.env`.
* Fetches channel information.
* Fetches videos from the channel's uploads playlist.
* Fetches video statistics.
* Handles YouTube API errors.
* Transforms YouTube data into the common CreatorIQ format.

The API key is not hard-coded in Python source code.

Example environment configuration:

```text
YOUTUBE_API_KEY=your_key_here
```

The `.env` file is excluded through `.gitignore`.

## Data Transformation Workflow

YouTube API data is transformed into a common CreatorIQ format.

```text
YouTube Response
      ↓
Extract Required Fields
      ↓
Transform Data
      ↓
CreatorIQ Common Format
      ↓
PostgreSQL
```

The common format includes:

```text
platform
external_content_id
content_title
views
likes
comments
shares
saves
watch_time
reach
published_date
engagement_rate
```

YouTube provides views, likes, comments, video ID, title, and published date.

Fields that are not provided by the YouTube Data API statistics used by this project are stored with appropriate default values.

## YouTube Synchronization

The synchronization endpoint is:

```text
POST /social/youtube/sync
```

The workflow is:

```text
API Request
     ↓
Fetch YouTube Videos
     ↓
Fetch Video Statistics
     ↓
Transform Data
     ↓
Validate Data
     ↓
Check Existing Content
     ↓
Create or Update PostgreSQL Record
     ↓
Return Synchronization Result
```

Example request:

```json
{
  "channel_id": "UC_x5XG1OV2P6uZZ5FSM9Ttw",
  "max_results": 5
}
```

Example successful response:

```json
{
  "platform": "YouTube",
  "status": "success",
  "records_synced": 5
}
```

## Duplicate Synchronization

Duplicate YouTube content is prevented using:

```text
platform + external_content_id
```

During synchronization:

```text
Record exists?
     ↓
   YES → Update existing record
     ↓
    NO → Create new record
```

This allows the same synchronization request to be executed multiple times without unnecessarily creating duplicate YouTube content records.

## Error Handling

The YouTube integration handles common errors including:

* Invalid API key
* Invalid channel ID
* Invalid video ID
* API request failure
* Empty API response
* Duplicate records
* API quota/rate-limit errors
* Unexpected API responses

Meaningful HTTP responses are returned through FastAPI instead of allowing the application to terminate unexpectedly.

## Analytics APIs

The existing analytics APIs work with the synchronized YouTube records.

Important endpoints include:

```text
GET /analytics/summary
GET /analytics/top-content
GET /analytics/platform-comparison
GET /analytics/chart/engagement
GET /analytics/chart/followers
```

The analytics service operates on the common `Content` and `Growth` data rather than using separate YouTube-specific analytics logic.

### Dashboard Summary

```text
GET /analytics/summary
```

Returns aggregated views, likes, comments, shares, reach, followers, and average engagement rate.

### Top Content

```text
GET /analytics/top-content
```

Returns top-performing content based on engagement rate.

### Platform Comparison

```text
GET /analytics/platform-comparison
```

Compares content performance across platforms.

### Engagement Chart

```text
GET /analytics/chart/engagement
```

Returns dashboard-ready labels and engagement-rate values from growth data.

### Follower Chart

```text
GET /analytics/chart/followers
```

Returns dashboard-ready labels and follower values from growth data.

## Testing Procedure

The implementation was tested using FastAPI Swagger UI and PostgreSQL/pgAdmin.

### YouTube API Service Testing

The YouTube service was tested directly to verify:

* YouTube API authentication
* Channel data retrieval
* Video retrieval
* Video statistics retrieval

### Swagger Testing

The following endpoint was tested successfully:

```text
POST /social/youtube/sync
```

Example result:

```json
{
  "platform": "YouTube",
  "status": "success",
  "records_synced": 5
}
```

The existing analytics APIs were also tested through Swagger.

### PostgreSQL Verification

After synchronization, the synchronized YouTube records were verified in PostgreSQL using pgAdmin.

Five YouTube records were successfully stored in the `content` table during testing.

### End-to-End Workflow

```text
YouTube API
     ↓
YouTube Service
     ↓
Data Transformation
     ↓
POST /social/youtube/sync
     ↓
PostgreSQL
     ↓
Analytics Service
     ↓
Analytics APIs
     ↓
Dashboard-ready Data
```

## Project Structure

```text
creatoriq/
│
├── .env
├── .gitignore
├── requirements.txt
├── README.md
│
├── app/
│   ├── main.py
│   │
│   ├── core/
│   │   ├── config.py
│   │   └── security.py
│   │
│   ├── db/
│   │   └── database.py
│   │
│   ├── models/
│   │   ├── user.py
│   │   ├── content.py
│   │   ├── audience.py
│   │   └── growth.py
│   │
│   ├── schemas/
│   │   ├── user.py
│   │   ├── content.py
│   │   ├── audience.py
│   │   └── growth.py
│   │
│   ├── routers/
│   │   ├── users.py
│   │   ├── content.py
│   │   ├── analytics.py
│   │   ├── audience.py
│   │   └── social.py
│   │
│   └── services/
│       ├── analytics_service.py
│       ├── audience_service.py
│       ├── growth_service.py
│       ├── social_media.py
│       └── youtube_service.py
│
└── tests/
```

## Security

API credentials and sensitive information must not be committed to GitHub.

The following are excluded from version control:

```text
.env
venv/
__pycache__/
```

The YouTube API key is stored only in the local `.env` file.

Before committing or pushing changes, verify that no API keys, passwords, tokens, or other confidential information are staged.

## Sprint 5 Completion

Sprint 5 – Real Social Media API Integration & End-to-End Integration includes:

* YouTube API integration
* Secure API credential management
* YouTube data fetching
* Data transformation
* PostgreSQL synchronization
* Duplicate synchronization handling
* Error handling
* Existing analytics integration
* Platform comparison
* Dashboard-ready chart APIs
* Swagger testing
* PostgreSQL/pgAdmin verification
* README documentation

## Milestone 2 Workflow

The completed backend supports the following overall workflow:

```text
User Login
    ↓
Creator
    ↓
Content
    ↓
Content Analytics
    ↓
Engagement Analytics
    ↓
Audience Analytics
    ↓
Growth Analytics
    ↓
YouTube Data
    ↓
Platform Comparison
    ↓
Dashboard APIs
```

This completes the Sprint 5 objective of integrating real YouTube data into the existing CreatorIQ analytics workflow.
