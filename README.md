# CreatorIQ – Creator Analytics & Content Performance Dashboard

CreatorIQ is a creator analytics platform that collects, stores, processes, analyzes, and visualizes creator and social media data.

The project uses a FastAPI backend, PostgreSQL database, analytics services, and a React frontend dashboard.

The system was extended from the existing YouTube implementation to support multi-platform analytics using a common CreatorIQ data structure.

---

## Project Overview

CreatorIQ provides a centralized analytics workflow for creator and social media data.

The application supports:

- User registration and authentication
- Content management
- Content performance analytics
- Engagement analytics
- Audience analytics
- Growth analytics
- Revenue analytics
- Social media synchronization
- Multi-platform analytics
- Platform filtering
- Platform comparison
- Creator reports
- PDF report export
- Excel report export
- Dashboard visualization

---

## Technology Stack

### Backend

- Python
- FastAPI
- SQLAlchemy
- PostgreSQL
- Pydantic
- Uvicorn
- Swagger / OpenAPI
- Google YouTube Data API v3

### Frontend

- React
- Vite
- Tailwind CSS
- Axios
- React Router
- Recharts

### Database

- PostgreSQL
- pgAdmin

---

## System Architecture

The overall CreatorIQ workflow is:

Social Media Platform
        ↓
Platform Service
        ↓
Data Transformation
        ↓
Validation / Duplicate Handling
        ↓
PostgreSQL
        ↓
Analytics Services
        ↓
FastAPI APIs
        ↓
React Dashboard