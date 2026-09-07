# CreatorIQ API

CreatorIQ is a FastAPI-based creator analytics platform that collects and analyzes social media content data.

The project provides APIs for user management, authentication, content management, audience analytics, growth analytics, social media synchronization, and platform comparison.

## Project Overview

CreatorIQ provides a centralized analytics workflow for creator and social media data.

The application supports:

- User registration and authentication
- Content management
- Content engagement analytics
- Audience analytics
- Growth analytics
- Platform performance comparison
- Social media platform synchronization
- YouTube Data API integration
- Dashboard-ready analytics APIs

## Technology Stack

- Python
- FastAPI
- SQLAlchemy
- PostgreSQL
- Pydantic
- Google YouTube Data API v3
- Uvicorn
- Swagger / OpenAPI
- pgAdmin

## System Architecture
Social Media API
       ↓
Social Media Service
       ↓
Data Transformation
       ↓
PostgreSQL
       ↓
Analytics & Revenue Services
       ↓
Reporting Service
       ↓
Notification / Report APIs
       ↓
PDF / Excel Export
       ↓
Creator Dashboard

## Notifications, Reporting & Exportable Reports

### Notification & Alert System

CreatorIQ provides an in-portal notification system to keep creators informed about important analytics and revenue updates.

The system supports:

- Performance alerts based on content views
- Engagement alerts based on content engagement rate
- Revenue alerts for revenue milestones
- Automatic alert generation
- Read and unread notification status
- Creator-specific notifications

Notifications are available through the API and can be displayed in the creator dashboard. No pop-up notifications are required.

### Analytics Reports

CreatorIQ can generate creator-specific analytics reports using existing analytics and revenue data.

Reports include:

- Content performance
- Audience analytics
- Revenue analytics
- Growth trends
- Platform comparison

The reporting system reuses existing CreatorIQ database data and analytics logic.

### Report Export

Creator reports can be exported in the following formats:

- PDF reports
- Excel reports

The exported reports contain relevant analytics summaries and KPIs, including content performance, audience analytics, revenue analytics, and growth trends.

### API Testing and Validation

The Sprint 7 APIs were tested using Swagger.

Testing includes:

- Notification API testing
- Automatic performance, engagement, and revenue alerts
- Creator report generation
- PDF report export
- Excel report export
- Invalid creator ID handling
- Input validation
- PostgreSQL data verification

Invalid or non-existent creator IDs return appropriate error responses.

