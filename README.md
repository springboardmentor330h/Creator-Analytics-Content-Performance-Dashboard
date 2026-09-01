# CreatorIQ – Creator Analytics & Content Performance Dashboard

## Project Overview

CreatorIQ is a creator analytics platform that helps creators analyze their social media content, audience, engagement, reach, and follower growth.

The system collects content and audience data, stores it in PostgreSQL, processes analytics using a FastAPI backend, and provides dashboard-ready APIs for a future React frontend.

## System Architecture

Social Media Platforms
        ↓
Social Media / YouTube Service
        ↓
Data Transformation
        ↓
PostgreSQL Database
        ↓
Analytics Services
        ↓
FastAPI APIs
        ↓
React Dashboard

## Technologies Used

- Python
- FastAPI
- SQLAlchemy
- PostgreSQL
- Pydantic
- Google YouTube Data API
- Uvicorn
- React (Dashboard)

## Modules Implemented

### User Module

- User registration
- User login
- User management

### Content Module

Stores content performance information such as:

- Platform
- Content title
- Views
- Likes
- Comments
- Shares
- Saves
- Watch time
- Reach
- Published date

### Content Analytics

Provides:

- Content engagement
- Top performing content
- Platform performance
- Dashboard KPI summary

### Audience Analytics

Provides:

- Total followers
- Total reach
- Total impressions
- Gender distribution
- Age distribution
- Top countries
- Top cities
- Device usage

### Growth Analytics

Tracks:

- Daily followers
- Reach
- Engagement rate
- Follower growth trends

## YouTube API Integration

CreatorIQ integrates with the YouTube Data API to fetch real YouTube content information.

The YouTube API key is stored securely in the `.env` file.

Example:

YOUTUBE_API_KEY=your_api_key_here

API credentials are not stored directly in Python source code.

## Data Transformation Workflow

YouTube API Response
        ↓
Extract Required Fields
        ↓
Transform into CreatorIQ Common Format
        ↓
Validate Data
        ↓
Store in PostgreSQL

The common data format contains:

- Platform
- External content ID
- Content title
- Views
- Likes
- Comments
- Shares
- Reach
- Published date

## Synchronization Workflow

The YouTube synchronization process follows:

YouTube API
        ↓
YouTube Service
        ↓
Data Transformation
        ↓
Duplicate Check
        ↓
Create / Update Content
        ↓
PostgreSQL
        ↓
Analytics APIs

Duplicate synchronization is handled using the platform and external content identifier.

## APIs Implemented

### Content APIs

- Content CRUD APIs

### Analytics APIs

- GET `/analytics/summary`
- GET `/analytics/content/{content_id}/engagement`
- GET `/analytics/top-content`
- GET `/analytics/platform-performance`
- GET `/analytics/platform-comparison`
- GET `/analytics/chart/engagement`
- GET `/analytics/chart/followers`

### Audience APIs

- POST `/audience`
- GET `/audience`
- GET `/audience/{id}`
- PUT `/audience/{id}`
- DELETE `/audience/{id}`
- GET `/analytics/audience`
- GET `/analytics/growth`
- GET `/analytics/audience-trends`

### Social Media APIs

- POST `/social/connect`
- GET `/social/platforms`
- POST `/social/sync`
- POST `/social/youtube/sync`

## Database Tables

The PostgreSQL database contains tables for:

- users
- content
- audience
- growth

YouTube synchronized content is stored in the `content` table.

## Testing

The APIs are tested using FastAPI Swagger UI.

Testing includes:

- Correct HTTP methods
- Request validation
- API responses
- Database data verification
- Analytics calculations
- YouTube synchronization
- Duplicate synchronization handling

PostgreSQL records are verified using pgAdmin.

## Security

Sensitive credentials such as:

- API keys
- Passwords
- Access tokens

are stored in `.env` and should not be committed to GitHub.

The `.env` file must be included in `.gitignore`.

## Project Goal

The final goal of CreatorIQ is to provide a unified analytics platform where creators can connect social media platforms, synchronize their content data, analyze performance, understand their audience, track growth, and view the results through a dashboard.