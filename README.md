# CreatorIQ

A full-stack creator analytics and content performance dashboard built with **FastAPI, React, PostgreSQL, SQLAlchemy, Axios, Tailwind CSS, and Chart.js**.

CreatorIQ provides creator management, content analytics, audience insights, growth tracking, revenue analytics, sponsorship tracking, notifications, reporting, and social media integration through a FastAPI backend and a React-based dashboard.

---

## Project Overview

CreatorIQ provides:

* User management and JWT authentication
* Creator profile and settings
* Content management and analytics
* Audience analytics
* Growth and trend analytics
* Revenue analytics
* Sponsorship tracking
* Social media integration
* YouTube API integration
* Notifications and performance alerts
* PDF and Excel report generation
* React-based analytics dashboard

The application follows a full-stack architecture where the React frontend consumes existing FastAPI APIs and displays data retrieved from PostgreSQL.

---

# System Architecture

```text
                    CreatorIQ Dashboard
                           │
                           ▼
                    React Frontend
                           │
                    React Router
                           │
                         Axios
                           │
                           ▼
                    FastAPI Backend
                           │
             ┌─────────────┴─────────────┐
             │                           │
          Routers                     Services
             │                           │
             └─────────────┬─────────────┘
                           │
                       PostgreSQL
                           │
                           ▼
                      Real Data
                           │
                           ▼
                 Dashboard Visualization
```

The frontend does not duplicate backend analytics logic. It consumes the existing FastAPI APIs and displays the returned project data.

---

# Technology Stack

## Backend

* Python
* FastAPI
* SQLAlchemy
* PostgreSQL
* Pydantic
* JWT Authentication
* Passlib / bcrypt
* Uvicorn
* Alembic

## Frontend

* React
* Vite
* React Router
* Axios
* Tailwind CSS
* Chart.js
* React Chart.js 2

## External Integration

* YouTube Data API v3

## Reporting

* PDF generation
* Excel generation

---

# Backend Modules

## User Management

* User registration
* User login
* Password hashing
* JWT authentication
* Current user profile
* User update and deletion
* User search by role

## Content Analytics

* Content performance
* Engagement analytics
* Content comparison
* Top-performing content
* Reach analysis
* Performance trends

Metrics include:

* Views
* Likes
* Comments
* Shares
* Saves
* Watch time
* Reach
* Engagement rate

## Audience Analytics

* Audience demographics
* Gender distribution
* Age distribution
* Country analysis
* City analysis
* Device distribution
* Audience trends

## Growth Analytics

* Follower growth
* Reach trends
* Engagement-rate trends
* Growth trends

## Revenue Analytics

* Revenue tracking
* Revenue by source
* Revenue transactions
* Total revenue calculation
* Monthly revenue
* Revenue trends

## Sponsorships

* Sponsorship information
* Sponsorship tracking
* Payment status

## Social Media Integration

* Platform connection
* Connected platform listing
* Platform synchronization
* YouTube API integration
* YouTube content synchronization

## Notifications

* Create notifications
* List notifications
* Unread notifications
* Mark notification as read
* Mark all notifications as read
* Performance alerts
* Engagement alerts
* Revenue alerts

## Reporting & Export

* Creator analytics reports
* PDF reports
* Excel reports
* Combined analytics and revenue reporting

---

# React Frontend

The React frontend provides a complete CreatorIQ dashboard connected to the existing FastAPI backend.

## Frontend Pages

The following pages are implemented:

1. **Login**
2. **Dashboard**
3. **Content Analytics**
4. **Audience Analytics**
5. **Growth & Trends**
6. **Revenue**
7. **Sponsorships**
8. **Notifications**
9. **Reports**
10. **Profile & Settings**

---

# Dashboard

The main dashboard provides an overview of creator performance.

It displays KPI cards for:

* Total Views
* Total Likes
* Total Comments
* Total Reach

It also provides:

* Follower growth
* Content analytics
* Top-performing content
* Reach analysis
* Performance information
* Charts and tables

The dashboard uses data returned from the FastAPI backend rather than hard-coded analytics values.

---

# Content Analytics

The Content Analytics page displays content performance using backend analytics APIs.

It includes:

* Views
* Likes
* Comments
* Reach
* Engagement rate
* Top-performing content
* Content comparison
* Performance trends

Charts, KPI cards, and tables are used to visualize the data.

---

# Audience Analytics

The Audience Analytics page displays:

* Total followers
* Total reach
* Total impressions
* Gender distribution
* Age distribution
* Top countries
* Top cities
* Device distribution
* Audience trends

---

# Growth & Trends

The Growth & Trends page displays:

* Follower growth
* Reach trends
* Engagement-rate trends
* Growth charts
* Performance trends

---

# Revenue

The Revenue page integrates the existing revenue APIs and displays:

* Total revenue
* Revenue by source
* Revenue transactions
* Monthly revenue
* Revenue trends

---

# Sponsorships

The Sponsorships page displays sponsorship information retrieved from the backend.

It includes:

* Sponsorship details
* Payment status
* Sponsorship-related information

---

# Notifications

The Notifications page integrates the existing notification APIs.

It provides:

* Notification list
* Read/unread notifications
* Performance alerts
* Engagement alerts
* Revenue alerts
* Mark as read functionality
* Mark all as read functionality

---

# Reports & Export

The Reports page connects to the existing reporting APIs.

Supported exports:

* PDF
* Excel

The creator report combines:

* Dashboard summary
* Content performance
* Audience analytics
* Revenue analytics
* Growth trends
* Audience trends
* Platform comparison

The same report data is used to generate PDF and Excel reports.

---

# Profile & Settings

The Profile & Settings page is connected to the authenticated user's backend data.

It retrieves the current user using:

```text
GET /users/me
```

The page displays:

* Full name
* Email
* Account role

Profile updates use the existing:

```text
PUT /users/{user_id}
```

The frontend does not hard-code the logged-in user's information.

---

# Authentication

CreatorIQ uses JWT-based authentication.

Login flow:

```text
Login Page
    ↓
POST /login
    ↓
FastAPI validates credentials
    ↓
JWT Access Token
    ↓
React stores/uses token
    ↓
Axios attaches Bearer token
    ↓
Protected FastAPI APIs
```

The Axios client automatically attaches the JWT token to authenticated requests.

Example:

```text
Authorization: Bearer <access_token>
```

The backend validates the token using the existing authentication system.

---

# API Integration

The React frontend communicates with the FastAPI backend using Axios.

The frontend does not implement duplicate analytics calculations.

Workflow:

```text
React Dashboard
       ↓
     Axios
       ↓
FastAPI API
       ↓
PostgreSQL
       ↓
Real Project Data
       ↓
React Dashboard
```

Where backend APIs are available, the frontend uses the existing APIs to retrieve and display data.

---

# Important API Endpoints

## Authentication

```text
POST /login
GET /users/me
```

## User Management

```text
POST /users
GET /users
GET /users/search
GET /users/{user_id}
PUT /users/{user_id}
DELETE /users/{user_id}
```

## Analytics

```text
GET /analytics/summary
GET /analytics/top-content
GET /analytics/platform-comparison
GET /analytics/chart/engagement
GET /analytics/chart/followers
GET /analytics/audience
GET /analytics/growth
GET /analytics/audience-trends
```

## Revenue

```text
POST /revenue
GET /revenue
GET /revenue/{id}
PUT /revenue/{id}
DELETE /revenue/{id}
```

## Notifications

```text
POST /notifications
GET /notifications
GET /notifications/unread
GET /notifications/{notification_id}
PUT /notifications/{notification_id}/read
PUT /notifications/read-all
```

## Reporting

```text
GET /reports/creator
GET /reports/creator/pdf
GET /reports/creator/excel
```

## YouTube

```text
POST /social/youtube/sync
```

---

# YouTube API Integration

The YouTube Data API v3 is integrated through:

```text
app/services/youtube_service.py
```

The YouTube service:

* Connects to YouTube Data API v3
* Fetches channel information
* Fetches videos
* Fetches video statistics
* Transforms YouTube data into the CreatorIQ format
* Handles API errors

The API key is stored securely in `.env`.

Example:

```text
YOUTUBE_API_KEY=your_key_here
```

The `.env` file is excluded from Git using `.gitignore`.

---

# YouTube Synchronization

Endpoint:

```text
POST /social/youtube/sync
```

Workflow:

```text
YouTube API
    ↓
Fetch Videos
    ↓
Fetch Statistics
    ↓
Transform Data
    ↓
Validate Data
    ↓
Check Existing Content
    ↓
Create / Update PostgreSQL Record
    ↓
Return Result
```

Duplicate content is prevented using:

```text
platform + external_content_id
```

If a record already exists, it is updated instead of creating a duplicate.

---

# Database

The project uses PostgreSQL.

Main tables include:

```text
users
content
audience
growth
revenue
sponsorship
notifications
```

SQLAlchemy is used for database operations and model management.

---

# Frontend Project Structure

```text
frontend/
│
├── src/
│   │
│   ├── api/
│   │   └── axios.js
│   │
│   ├── assets/
│   │
│   ├── components/
│   │   ├── charts/
│   │   ├── common/
│   │   │   └── KpiCard.jsx
│   │   │
│   │   └── layout/
│   │       ├── Header.jsx
│   │       ├── Layout.jsx
│   │       └── Sidebar.jsx
│   │
│   ├── pages/
│   │   ├── Login.jsx
│   │   ├── Dashboard.jsx
│   │   ├── ContentAnalytics.jsx
│   │   ├── AudienceAnalytics.jsx
│   │   ├── GrowthTrends.jsx
│   │   ├── Revenue.jsx
│   │   ├── Sponsorships.jsx
│   │   ├── Notifications.jsx
│   │   ├── Reports.jsx
│   │   └── Profile.jsx
│   │
│   ├── App.jsx
│   ├── App.css
│   ├── index.css
│   └── main.jsx
│
└── package.json
```

---

# Backend Project Structure

```text
creatoriq/
│
├── .env
├── .gitignore
├── requirements.txt
├── README.md
│
├── alembic/
│   ├── env.py
│   └── versions/
│
├── app/
│   ├── main.py
│   │
│   ├── core/
│   │   ├── config.py
│   │   ├── security.py
│   │   └── auth.py
│   │
│   ├── db/
│   │   └── database.py
│   │
│   ├── models/
│   │   ├── user.py
│   │   ├── content.py
│   │   ├── audience.py
│   │   ├── growth.py
│   │   ├── revenue.py
│   │   ├── sponsorship.py
│   │   └── notification.py
│   │
│   ├── schemas/
│   │   ├── user.py
│   │   ├── content.py
│   │   ├── audience.py
│   │   ├── growth.py
│   │   ├── revenue.py
│   │   ├── sponsorship.py
│   │   ├── notification.py
│   │   └── report.py
│   │
│   ├── routers/
│   │   ├── users.py
│   │   ├── content.py
│   │   ├── analytics.py
│   │   ├── audience.py
│   │   ├── revenue.py
│   │   ├── sponsorship.py
│   │   ├── social.py
│   │   ├── notification.py
│   │   └── reports.py
│   │
│   └── services/
│       ├── analytics_service.py
│       ├── audience_service.py
│       ├── content_service.py
│       ├── revenue_service.py
│       ├── notification_service.py
│       ├── reporting_service.py
│       ├── pdf_service.py
│       ├── excel_service.py
│       ├── social_media.py
│       └── youtube_service.py
│
└── tests/
```

---

# Testing

The implementation was tested using:

* FastAPI Swagger UI
* PostgreSQL
* pgAdmin
* React frontend
* Browser testing
* Frontend-to-backend API requests

Testing includes:

* User authentication
* JWT authentication
* Current user profile
* Profile updates
* Content APIs
* Content analytics
* Audience analytics
* Growth analytics
* Revenue APIs
* Sponsorship APIs
* YouTube synchronization
* Notification APIs
* Dashboard data loading
* PDF report generation
* Excel report generation
* PostgreSQL data verification
* Frontend API integration

Swagger documentation:

```text
http://127.0.0.1:8000/docs
```

---

# Frontend Loading and Error Handling

The frontend handles API states including:

* Loading states
* API errors
* Empty data states
* Successful data rendering

This prevents the dashboard from displaying misleading or broken information when an API request fails or no data is available.

---

# Responsive UI

The React dashboard uses Tailwind CSS responsive utilities to provide a basic responsive interface for:

* Desktop
* Tablet
* Mobile screen sizes

The layout includes responsive navigation, dashboard cards, tables, charts, and profile components.

---

# Security

Sensitive information must not be committed to GitHub.

The following are excluded from version control:

```text
.env
venv/
__pycache__/
```

API keys, passwords, JWT secrets, database credentials, and other sensitive information must remain outside the source code.

---

# Running the Backend

Activate the virtual environment:

```powershell
venv\Scripts\activate
```

Run the FastAPI application:

```powershell
uvicorn app.main:app --reload
```

Open Swagger:

```text
http://127.0.0.1:8000/docs
```

---

# Running the Frontend

Navigate to the frontend directory:

```powershell
cd frontend
```

Install dependencies:

```powershell
npm install
```

Start the React development server:

```powershell
npm run dev
```

The frontend communicates with the FastAPI backend through the configured Axios base URL.

---

# Expected Dashboard Flow

```text
Login
  ↓
Creator Dashboard
  ↓
Content Analytics
  ↓
Audience Analytics
  ↓
Growth & Trends
  ↓
Revenue & Sponsorship
  ↓
Notifications
  ↓
Reports & Export
  ↓
Profile & Settings
```

---

# Frontend & Dashboard Integration Sprint

The frontend integration sprint connects the previously developed FastAPI backend modules to a React-based CreatorIQ dashboard.

Completed frontend deliverables include:

* React frontend configuration
* React Router configuration
* Axios API integration
* Tailwind CSS interface
* Charting integration
* Reusable component structure
* CreatorIQ dashboard layout
* Navigation/sidebar
* Header
* Dashboard KPI cards
* Charts
* Tables
* User/profile section
* Required dashboard pages
* Analytics visualization
* Revenue and sponsorship integration
* Notification integration
* Reporting integration
* PDF download
* Excel download
* JWT login
* Current user profile
* Basic responsive UI
* Loading and error handling
* Frontend-backend workflow testing

The frontend uses existing FastAPI APIs and does not duplicate backend analytics logic.

---

# Sprint Completion

The CreatorIQ project now provides an integrated full-stack creator analytics platform.

The backend provides:

* User management
* JWT authentication
* Content analytics
* Audience analytics
* Growth analytics
* Revenue analytics
* Sponsorship tracking
* Social media integration
* YouTube synchronization
* Notifications
* Reporting
* PDF and Excel exports

The React frontend provides:

* Login
* Creator dashboard
* Analytics visualization
* KPI cards
* Charts
* Tables
* Revenue and sponsorship views
* Notifications
* Reports and exports
* Profile and settings

---

# Overall Project Status

**CreatorIQ is an integrated FastAPI + React + PostgreSQL creator analytics platform.**

The application connects the React dashboard to the existing FastAPI backend through Axios and displays project data retrieved from PostgreSQL.

The system supports creator analytics, content performance, audience insights, growth trends, revenue tracking, sponsorships, notifications, YouTube integration, and exportable PDF/Excel reports.
