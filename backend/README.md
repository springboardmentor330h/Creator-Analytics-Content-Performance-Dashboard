# CreatorIQ API

CreatorIQ is a FastAPI-based creator analytics platform that collects and analyzes social media content data.

The project provides APIs for user management, authentication, content management, audience analytics, growth analytics, social media synchronization, and platform comparison.

---

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

---

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

---

## System Architecture

The overall workflow is:

```text
Social Media API
       ↓
Social Media Service
       ↓
Data Transformation
       ↓
PostgreSQL
       ↓
Analytics Service
       ↓
FastAPI APIs
       ↓
Dashboard