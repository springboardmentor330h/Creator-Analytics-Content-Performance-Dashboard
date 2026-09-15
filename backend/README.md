# CreatorIQ

CreatorIQ is a FastAPI-based backend application for creator content performance, audience analytics, growth tracking, social media integration, revenue management, notifications, reporting, and exportable analytics reports.

## Project Overview

CreatorIQ provides a centralized backend system for managing creator data and analyzing content, audience, growth, social media performance, revenue, and sponsorship information.

The backend is developed using FastAPI and PostgreSQL with SQLAlchemy ORM and Alembic database migrations.

## Technology Stack

- Python
- FastAPI
- PostgreSQL
- SQLAlchemy
- Pydantic
- Alembic
- JWT Authentication
- YouTube Data API
- ReportLab
- OpenPyXL
- Swagger / OpenAPI

## Backend Modules

### 1. User Management

- User registration and login
- JWT authentication
- User profile management
- Role-based access control
- Supported roles:
  - Creator
  - Agency
  - Marketing Team
  - Administrator

### 2. Content Management

- Creator content management
- Platform-based content tracking
- Content performance metrics
- YouTube content synchronization
- External content ID support

### 3. Engagement Analytics

- Total engagement calculation
- Engagement rate calculation
- Content performance analysis
- Top-performing content analysis
- Platform performance comparison

### 4. Audience Analytics

- Audience demographic information
- Age group analysis
- Gender analysis
- Country and city analysis
- Device type analysis
- Audience reach and impressions

### 5. Growth Analytics

- Follower growth tracking
- Reach tracking
- Engagement rate trends
- Audience growth analysis
- Growth trend reporting

### 6. Social Media Integration

- Social media platform management
- YouTube API integration
- YouTube content synchronization
- Social media performance data processing
- Platform-specific analytics

### 7. Revenue Management

- Revenue creation and management
- Revenue source tracking
- Revenue date tracking
- Total revenue analytics
- Revenue by source
- Monthly revenue analysis
- Revenue trend analysis

### 8. Sponsorship Management

- Sponsorship creation
- Sponsorship updates
- Sponsorship deletion
- Brand and campaign tracking
- Contract value management
- Sponsorship status tracking
- Payment status tracking

### 9. Notification & Alert System

- Creator notifications
- Read/unread notification status
- Performance alerts
- Engagement milestone notifications
- Revenue milestone alerts
- Notification management APIs

### 10. Reporting System

The reporting module combines existing analytics and database data into a structured creator report.

Reports include:

- Content performance
- Audience analytics
- Growth trends
- Platform comparison
- Revenue analytics
- Monthly revenue
- Revenue trends

### 11. Report Export

Creators can export their reports in:

- PDF format
- Excel (.xlsx) format

Exported reports contain relevant analytics, KPIs, summaries, and tables.

### 12. Database Management

- PostgreSQL database
- SQLAlchemy ORM
- Alembic database migrations
- Database schema management
- Creator-based data separation

## API Documentation

The FastAPI application provides interactive API documentation using Swagger UI.

After starting the backend, Swagger UI is available at:

`/docs`

## Authentication

The backend uses JWT-based authentication.

Protected APIs validate the authenticated user before providing access to creator-specific resources.

Creators can access only their own reports and data.

## Project Structure

```text
backend/
│
├── app/
│   ├── core/
│   ├── db/
│   ├── models/
│   ├── routers/
│   ├── schemas/
│   └── services/
│
├── alembic/
│   └── versions/
│
├── tests/
│
├── requirements.txt
├── alembic.ini
└── README.md
```
