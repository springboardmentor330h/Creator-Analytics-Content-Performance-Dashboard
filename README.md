# CreatorIQ

A FastAPI-based backend for managing creator content, analytics, audience insights, growth trends, revenue analytics, notifications, and social media data.

## Project Overview

CreatorIQ provides backend APIs for:

- User management and JWT authentication
- Content management and analytics
- Audience analytics
- Growth analytics
- Revenue analytics
- Social media integration
- YouTube API integration
- Notifications and performance alerts
- PDF and Excel report generation

The project uses FastAPI, SQLAlchemy, PostgreSQL, and external social media APIs.

---

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
Analytics
  ↓
Dashboard-ready Data

Modules
User Management
User registration
User login
Password hashing
JWT authentication
Content Analytics
Content performance
Engagement analytics
Content comparison
Top-performing content
Reach analysis
Performance trends
Audience Analytics
Audience demographics
Gender distribution
Age distribution
Country and city analysis
Device distribution
Audience trends
Growth Analytics
Follower growth
Reach trends
Engagement-rate trends
Revenue Analytics
Revenue tracking
Revenue by source
Revenue transactions
Total revenue calculation
Social Media Integration
Platform connection
Platform listing
Platform synchronization
YouTube API integration
YouTube content synchronization
Notifications
Create notifications
List notifications
Unread notifications
Mark notification as read
Mark all notifications as read
Performance alerts
Engagement alerts
Revenue alerts
Reporting & Export
Creator analytics reports
PDF reports
Excel reports
Combined analytics and revenue reporting
Database

The project uses PostgreSQL.

Main tables include:

users
content
audience
growth
revenue
sponsorship
notifications
YouTube API Integration

The YouTube Data API v3 is integrated through:

app/services/youtube_service.py

The YouTube service:

Connects to YouTube Data API v3
Fetches channel information
Fetches videos
Fetches video statistics
Transforms YouTube data into the CreatorIQ format
Handles API errors

The API key is stored securely in .env.

Example:

YOUTUBE_API_KEY=your_key_here

The .env file is excluded from Git using .gitignore.

YouTube Synchronization

Endpoint:

POST /social/youtube/sync

Workflow:

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

Duplicate content is prevented using:

platform + external_content_id

If the record already exists, it is updated instead of creating a duplicate.

Analytics APIs

Important endpoints include:

GET /analytics/summary
GET /analytics/top-content
GET /analytics/platform-comparison
GET /analytics/chart/engagement
GET /analytics/chart/followers

These APIs use the common CreatorIQ database models and provide dashboard-ready analytics data.

Audience & Growth APIs
GET /analytics/audience
GET /analytics/growth
GET /analytics/audience-trends

These APIs provide:

Followers
Reach
Impressions
Gender distribution
Age distribution
Countries
Cities
Device distribution
Growth trends
Revenue APIs
POST /revenue
GET /revenue
GET /revenue/{id}
PUT /revenue/{id}
DELETE /revenue/{id}

Revenue reporting provides:

Total revenue
Revenue by source
Revenue transactions
Notification APIs
POST /notifications
GET /notifications
GET /notifications/unread
GET /notifications/{notification_id}
PUT /notifications/{notification_id}/read
PUT /notifications/read-all

The notification system supports performance, engagement, and revenue alerts.

Reporting & Export APIs

Creator report:

GET /reports/creator

PDF report:

GET /reports/creator/pdf

Excel report:

GET /reports/creator/excel

The creator report combines:

Dashboard summary
Content performance
Audience analytics
Revenue analytics
Growth trends
Audience trends
Platform comparison

The same report data is used to generate PDF and Excel reports.

Project Structure
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
│   │   └── security.py
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
Testing

The implementation was tested using FastAPI Swagger UI and PostgreSQL/pgAdmin.

Testing includes:

User authentication
Content APIs
Analytics APIs
Audience analytics
Growth analytics
Revenue APIs
YouTube synchronization
Notification APIs
PDF report generation
Excel report generation
PostgreSQL data verification

Swagger documentation:

http://127.0.0.1:8000/docs
Security

Sensitive information must not be committed to GitHub.

The following are excluded from version control:

.env
venv/
__pycache__/

API keys, passwords, JWT secrets, and other credentials must remain in environment variables.

Running the Project

Activate the virtual environment:

venv\Scripts\activate

Run the FastAPI application:

uvicorn app.main:app --reload

Open Swagger:

http://127.0.0.1:8000/docs
Sprint 7 Completion

Sprint 7 – Notifications, Reporting & Exportable Reports includes:

Notification and alert system
Performance alerts
Engagement alerts
Revenue alerts
Creator analytics reporting
PDF report generation
Excel report generation
Revenue reporting
Integration with existing analytics
PostgreSQL integration
Swagger testing
Overall Workflow
User Login
    ↓
Content Management
    ↓
Content Analytics
    ↓
Audience Analytics
    ↓
Growth Analytics
    ↓
Revenue Analytics
    ↓
Social Media Integration
    ↓
YouTube Synchronization
    ↓
Notifications & Alerts
    ↓
Creator Reporting
    ↓
PDF / Excel Export
    ↓
Dashboard-ready Data
Project Status

CreatorIQ currently provides an integrated FastAPI backend covering creator management, content analytics, audience and growth analytics, revenue tracking, YouTube synchronization, notifications, and exportable creator reports.