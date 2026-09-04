"""
CreatorIQ - Complete Multi-Platform Analytics Engine (FastAPI Backend)
Organized with default containing:
- GET / (Home / Root)
- GET /users (Get Users)
- POST /users (Create User)
- GET /users/search (Search Users)
- GET /users/{user_id} (Get User)
- PUT /users/{user_id} (Update User)
- POST /auth/register (Register)
- POST /auth/login (Login)
- GET /auth/me (Get Me)
followed by content, analytics, audience, social media, revenue, sponsorships, notifications, reports.
"""
from fastapi import FastAPI, HTTPException, status, Query, Response, Body, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, Response
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.openapi.utils import get_openapi
from pydantic import BaseModel, EmailStr, Field
from typing import List, Optional, Dict, Any
from datetime import datetime
import hmac
import hashlib
import base64
import json

tags_metadata = [
    {"name": "default", "description": "Core authentication, user management, and system endpoints"},
    {"name": "content", "description": "Multi-platform content performance management"},
    {"name": "analytics", "description": "Engagement, growth, and conversion analytics"},
    {"name": "audience", "description": "Audience demographics, geographic cohorts, and devices"},
    {"name": "social media", "description": "Multi-platform integration (YouTube, Instagram, TikTok, LinkedIn, X, Facebook)"},
    {"name": "revenue", "description": "Monetization streams, payouts, and earnings"},
    {"name": "sponsorships", "description": "Brand deals, sponsorship contracts, and deliverables"},
    {"name": "notifications", "description": "System alerts, viral alerts, and notifications"},
    {"name": "reports", "description": "Comprehensive performance reports and exports"},
    {"name": "roles", "description": "User role management"},
    {"name": "dashboard", "description": "Dashboard overview telemetry"},
]

security = HTTPBearer(auto_error=False, description="Paste your JWT access token (e.g. eyJhbGciOiJIUzI1Ni...)")

app = FastAPI(
    title="CreatorIQ API",
    description="Unified multi-platform creator analytics, monetization, and reporting engine.",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json",
    openapi_tags=tags_metadata,
    dependencies=[Depends(security)]
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def custom_openapi():
    if app.openapi_schema:
        return app.openapi_schema
    openapi_schema = get_openapi(
        title="CreatorIQ API",
        version="1.0.0",
        description="Unified multi-platform creator analytics, monetization, and reporting engine.",
        routes=app.routes,
        tags=tags_metadata
    )
    components = openapi_schema.setdefault("components", {})
    components["securitySchemes"] = {
        "HTTPBearer": {
            "type": "http",
            "scheme": "bearer",
            "bearerFormat": "JWT",
            "description": "Enter your JWT Bearer token from POST /auth/login (e.g. eyJhbGciOiJIUzI1Ni...)"
        },
        "OAuth2PasswordBearer": {
            "type": "oauth2",
            "description": "OAuth2 Password Login",
            "flows": {
                "password": {
                    "tokenUrl": "/auth/login",
                    "scopes": {}
                }
            }
        }
    }
    openapi_schema["security"] = [
        {"HTTPBearer": []},
        {"OAuth2PasswordBearer": []}
    ]
    app.openapi_schema = openapi_schema
    return app.openapi_schema

app.openapi = custom_openapi

# ==========================================
# In-Memory Multi-Platform Datasets
# ==========================================

USERS = [
    {"id": 1, "full_name": "Monika Chowdary", "email": "monika@example.com", "role": "Creator"},
    {"id": 2, "full_name": "Test Creator", "email": "creator4@test.com", "role": "Creator"}
]

CONTENTS = [
    # YouTube
    {"id": 1, "creator_id": 1, "platform": "YouTube", "external_content_id": "yt_001", "content_title": "Full Stack React 19 & Node Tutorial 2026", "views": 45200, "likes": 3800, "comments": 420, "shares": 310, "saves": 950, "watch_time": 184000, "reach": 52000, "published_date": "2026-08-10"},
    {"id": 2, "creator_id": 1, "platform": "YouTube", "external_content_id": "yt_002", "content_title": "Top 10 Developer Productivity Hacks", "views": 28400, "likes": 2150, "comments": 290, "shares": 180, "saves": 620, "watch_time": 98000, "reach": 34000, "published_date": "2026-08-18"},
    {"id": 3, "creator_id": 1, "platform": "YouTube", "external_content_id": "yt_003", "content_title": "Building Production Microservices with Node.js", "views": 62100, "likes": 5400, "comments": 610, "shares": 490, "saves": 1420, "watch_time": 245000, "reach": 71000, "published_date": "2026-08-25"},
    {"id": 4, "creator_id": 1, "platform": "YouTube", "external_content_id": "yt_004", "content_title": "System Design Deep Dive: Scaling to 1M Users", "views": 84000, "likes": 7800, "comments": 890, "shares": 710, "saves": 2300, "watch_time": 312000, "reach": 95000, "published_date": "2026-08-29"},
    {"id": 5, "creator_id": 1, "platform": "YouTube", "external_content_id": "yt_005", "content_title": "Complete PostgreSQL Architecture & Query Optimization", "views": 39500, "likes": 3100, "comments": 340, "shares": 220, "saves": 880, "watch_time": 156000, "reach": 44000, "published_date": "2026-09-01"},
    {"id": 6, "creator_id": 1, "platform": "YouTube", "external_content_id": "yt_006", "content_title": "Docker & Kubernetes for Frontend Engineers", "views": 51200, "likes": 4300, "comments": 480, "shares": 350, "saves": 1150, "watch_time": 192000, "reach": 58000, "published_date": "2026-09-02"},
    {"id": 7, "creator_id": 1, "platform": "YouTube", "external_content_id": "yt_007", "content_title": "How to Build an AI Agent in 20 Minutes", "views": 98500, "likes": 9200, "comments": 1150, "shares": 840, "saves": 2900, "watch_time": 368000, "reach": 112000, "published_date": "2026-09-03"},
    # Instagram
    {"id": 8, "creator_id": 1, "platform": "Instagram", "external_content_id": "ig_001", "content_title": "Minimalist Desk Setup Tour & Ergonomics Guide", "views": 38500, "likes": 4900, "comments": 540, "shares": 620, "saves": 1100, "watch_time": 42000, "reach": 48000, "published_date": "2026-08-22"},
    {"id": 9, "creator_id": 1, "platform": "Instagram", "external_content_id": "ig_002", "content_title": "5 Modern CSS Tricks You Need in 2026", "views": 52000, "likes": 6300, "comments": 680, "shares": 890, "saves": 1850, "watch_time": 61000, "reach": 64000, "published_date": "2026-08-26"},
    {"id": 10, "creator_id": 1, "platform": "Instagram", "external_content_id": "ig_003", "content_title": "Day in the Life of a Senior Software Architect", "views": 44100, "likes": 5800, "comments": 610, "shares": 740, "saves": 1490, "watch_time": 51000, "reach": 56000, "published_date": "2026-08-28"},
    {"id": 11, "creator_id": 1, "platform": "Instagram", "external_content_id": "ig_004", "content_title": "Dark Mode UI Glassmorphism Tutorial Reel", "views": 68200, "likes": 8400, "comments": 920, "shares": 1120, "saves": 2400, "watch_time": 78000, "reach": 82000, "published_date": "2026-08-31"},
    {"id": 12, "creator_id": 1, "platform": "Instagram", "external_content_id": "ig_005", "content_title": "Clean Code vs Spaghetti Code Comparison", "views": 31500, "likes": 3900, "comments": 410, "shares": 480, "saves": 920, "watch_time": 36000, "reach": 39000, "published_date": "2026-09-01"},
    {"id": 13, "creator_id": 1, "platform": "Instagram", "external_content_id": "ig_006", "content_title": "My Ultimate Developer Morning Routine ☕💻", "views": 49800, "likes": 6100, "comments": 590, "shares": 780, "saves": 1340, "watch_time": 55000, "reach": 61000, "published_date": "2026-09-01"},
    {"id": 14, "creator_id": 1, "platform": "Instagram", "external_content_id": "ig_007", "content_title": "Top 5 VS Code Extensions That Save 10 Hours/Week", "views": 74500, "likes": 9300, "comments": 1040, "shares": 1350, "saves": 3100, "watch_time": 85000, "reach": 89000, "published_date": "2026-09-02"},
    {"id": 15, "creator_id": 1, "platform": "Instagram", "external_content_id": "ig_008", "content_title": "Interactive Carousel: JavaScript Event Loop Explained", "views": 58000, "likes": 7200, "comments": 780, "shares": 920, "saves": 2600, "watch_time": 66000, "reach": 71000, "published_date": "2026-09-02"},
    {"id": 16, "creator_id": 1, "platform": "Instagram", "external_content_id": "ig_009", "content_title": "Why I Switched from Mac to Custom Linux Rig", "views": 63200, "likes": 7900, "comments": 890, "shares": 950, "saves": 1820, "watch_time": 72000, "reach": 77000, "published_date": "2026-09-03"},
    {"id": 17, "creator_id": 1, "platform": "Instagram", "external_content_id": "ig_010", "content_title": "Tailwind v4 Cheat Sheet (Save This Post!)", "views": 82000, "likes": 10500, "comments": 1200, "shares": 1680, "saves": 4200, "watch_time": 92000, "reach": 99000, "published_date": "2026-09-03"},
    # TikTok
    {"id": 18, "creator_id": 1, "platform": "TikTok", "external_content_id": "tk_001", "content_title": "Fast vs Slow Coding Habits POV", "views": 64000, "likes": 8200, "comments": 730, "shares": 940, "saves": 2100, "watch_time": 55000, "reach": 78000, "published_date": "2026-08-29"},
    {"id": 19, "creator_id": 1, "platform": "TikTok", "external_content_id": "tk_002", "content_title": "When the Code Works on First Try 😂", "views": 95400, "likes": 14200, "comments": 1250, "shares": 1890, "saves": 3400, "watch_time": 84000, "reach": 115000, "published_date": "2026-08-30"},
    {"id": 20, "creator_id": 1, "platform": "TikTok", "external_content_id": "tk_003", "content_title": "Junior vs Senior Dev Debugging Approach", "views": 81200, "likes": 11800, "comments": 980, "shares": 1420, "saves": 2950, "watch_time": 72000, "reach": 98000, "published_date": "2026-08-31"},
    {"id": 21, "creator_id": 1, "platform": "TikTok", "external_content_id": "tk_004", "content_title": "3 AI Tools Every Programmer Must Use", "views": 112000, "likes": 16900, "comments": 1540, "shares": 2410, "saves": 4800, "watch_time": 98000, "reach": 134000, "published_date": "2026-09-01"},
    {"id": 22, "creator_id": 1, "platform": "TikTok", "external_content_id": "tk_005", "content_title": "Why Nobody Talks About Memory Leaks", "views": 73400, "likes": 9800, "comments": 810, "shares": 1120, "saves": 2200, "watch_time": 64000, "reach": 89000, "published_date": "2026-09-01"},
    {"id": 23, "creator_id": 1, "platform": "TikTok", "external_content_id": "tk_006", "content_title": "CSS Flexbox in 15 Seconds Flat", "views": 128000, "likes": 19400, "comments": 1680, "shares": 2950, "saves": 5600, "watch_time": 110000, "reach": 152000, "published_date": "2026-09-02"},
    {"id": 24, "creator_id": 1, "platform": "TikTok", "external_content_id": "tk_007", "content_title": "Things Clients Say That Keep Me Up at Night", "views": 89000, "likes": 13100, "comments": 1120, "shares": 1640, "saves": 2700, "watch_time": 77000, "reach": 107000, "published_date": "2026-09-02"},
    {"id": 25, "creator_id": 1, "platform": "TikTok", "external_content_id": "tk_008", "content_title": "How APIs Actually Talk to Databases (Visualized)", "views": 142000, "likes": 21500, "comments": 1950, "shares": 3400, "saves": 6800, "watch_time": 125000, "reach": 168000, "published_date": "2026-09-03"},
    {"id": 26, "creator_id": 1, "platform": "TikTok", "external_content_id": "tk_009", "content_title": "The Dark Secret of Git Merge vs Rebase", "views": 105000, "likes": 15600, "comments": 1340, "shares": 2180, "saves": 4100, "watch_time": 91000, "reach": 124000, "published_date": "2026-09-03"},
    # LinkedIn
    {"id": 27, "creator_id": 1, "platform": "LinkedIn", "external_content_id": "li_001", "content_title": "How I Scaled My Channel to 250K Subscribers", "views": 18200, "likes": 1450, "comments": 210, "shares": 340, "saves": 390, "watch_time": 21000, "reach": 24000, "published_date": "2026-08-28"},
    {"id": 28, "creator_id": 1, "platform": "LinkedIn", "external_content_id": "li_002", "content_title": "The Shift from Monolith to Event-Driven Architecture", "views": 24500, "likes": 2100, "comments": 310, "shares": 490, "saves": 680, "watch_time": 29000, "reach": 31000, "published_date": "2026-08-30"},
    {"id": 29, "creator_id": 1, "platform": "LinkedIn", "external_content_id": "li_003", "content_title": "Why Technical Documentation Is Your Greatest Asset", "views": 15800, "likes": 1290, "comments": 180, "shares": 270, "saves": 410, "watch_time": 18000, "reach": 21000, "published_date": "2026-09-01"},
    {"id": 30, "creator_id": 1, "platform": "LinkedIn", "external_content_id": "li_004", "content_title": "Lessons Learned Hiring 50+ Engineers for Startups", "views": 29800, "likes": 2850, "comments": 420, "shares": 610, "saves": 940, "watch_time": 38000, "reach": 38000, "published_date": "2026-09-01"},
    {"id": 31, "creator_id": 1, "platform": "LinkedIn", "external_content_id": "li_005", "content_title": "Why Senior Developers Write Less Code Than Juniors", "views": 34200, "likes": 3200, "comments": 480, "shares": 710, "saves": 1150, "watch_time": 42000, "reach": 44000, "published_date": "2026-09-02"},
    {"id": 32, "creator_id": 1, "platform": "LinkedIn", "external_content_id": "li_006", "content_title": "Engineering Leadership: Tech Debt vs Velocity", "views": 22400, "likes": 1980, "comments": 260, "shares": 380, "saves": 590, "watch_time": 27000, "reach": 29000, "published_date": "2026-09-02"},
    {"id": 33, "creator_id": 1, "platform": "LinkedIn", "external_content_id": "li_007", "content_title": "How We Cut Cloud Infrastructure Costs by 42%", "views": 41500, "likes": 4100, "comments": 580, "shares": 890, "saves": 1680, "watch_time": 52000, "reach": 55000, "published_date": "2026-09-03"},
    {"id": 34, "creator_id": 1, "platform": "LinkedIn", "external_content_id": "li_008", "content_title": "Framework Fatigue: Foundational CS Always Wins", "views": 31200, "likes": 2900, "comments": 390, "shares": 540, "saves": 980, "watch_time": 39000, "reach": 41000, "published_date": "2026-09-03"},
    # X
    {"id": 35, "creator_id": 1, "platform": "X", "external_content_id": "x_001", "content_title": "Thread: Web Development Trends in 2026 & Beyond 🧵", "views": 14500, "likes": 980, "comments": 140, "shares": 260, "saves": 310, "watch_time": 12000, "reach": 19500, "published_date": "2026-08-30"},
    {"id": 36, "creator_id": 1, "platform": "X", "external_content_id": "x_002", "content_title": "Stop using useEffect for data fetching in React 19.", "views": 38200, "likes": 3150, "comments": 490, "shares": 840, "saves": 1420, "watch_time": 28000, "reach": 48000, "published_date": "2026-08-31"},
    {"id": 37, "creator_id": 1, "platform": "X", "external_content_id": "x_003", "content_title": "TypeScript 5.8 features you will actually use every day", "views": 22100, "likes": 1840, "comments": 280, "shares": 410, "saves": 890, "watch_time": 19000, "reach": 29000, "published_date": "2026-09-01"},
    {"id": 38, "creator_id": 1, "platform": "X", "external_content_id": "x_004", "content_title": "Hot take: 90% of apps do not need microservices.", "views": 54200, "likes": 4900, "comments": 820, "shares": 1250, "saves": 1980, "watch_time": 41000, "reach": 68000, "published_date": "2026-09-02"},
    {"id": 39, "creator_id": 1, "platform": "X", "external_content_id": "x_005", "content_title": "The cleanest SQL query pattern for hierarchical data", "views": 29400, "likes": 2400, "comments": 310, "shares": 580, "saves": 1120, "watch_time": 23000, "reach": 37000, "published_date": "2026-09-02"},
    {"id": 40, "creator_id": 1, "platform": "X", "external_content_id": "x_006", "content_title": "Thread: 10 Linux CLI commands that feel like superpowers 🐧", "views": 48900, "likes": 4200, "comments": 560, "shares": 1140, "saves": 2250, "watch_time": 39000, "reach": 62000, "published_date": "2026-09-03"},
    {"id": 41, "creator_id": 1, "platform": "X", "external_content_id": "x_007", "content_title": "Build a custom HTTP server from scratch in Node", "views": 31500, "likes": 2750, "comments": 340, "shares": 620, "saves": 1340, "watch_time": 26000, "reach": 42000, "published_date": "2026-09-03"},
    # Facebook
    {"id": 42, "creator_id": 1, "platform": "Facebook", "external_content_id": "fb_001", "content_title": "Community Q&A: Software Engineering Roadmap", "views": 21400, "likes": 1680, "comments": 240, "shares": 190, "saves": 320, "watch_time": 25000, "reach": 28000, "published_date": "2026-08-24"},
    {"id": 43, "creator_id": 1, "platform": "Facebook", "external_content_id": "fb_002", "content_title": "Live Stream: Building a Modern SaaS Application", "views": 34200, "likes": 2950, "comments": 390, "shares": 310, "saves": 580, "watch_time": 48000, "reach": 42000, "published_date": "2026-08-27"},
    {"id": 44, "creator_id": 1, "platform": "Facebook", "external_content_id": "fb_003", "content_title": "Behind the Scenes: My Studio Recording Equipment", "views": 19800, "likes": 1490, "comments": 190, "shares": 150, "saves": 270, "watch_time": 21000, "reach": 25000, "published_date": "2026-09-01"},
    {"id": 45, "creator_id": 1, "platform": "Facebook", "external_content_id": "fb_004", "content_title": "Full Video: Best Practices for API Security", "views": 38900, "likes": 3400, "comments": 420, "shares": 380, "saves": 690, "watch_time": 52000, "reach": 49000, "published_date": "2026-09-02"},
    {"id": 46, "creator_id": 1, "platform": "Facebook", "external_content_id": "fb_005", "content_title": "Announcement: CreatorIQ Developer Meetup in Bengaluru!", "views": 26500, "likes": 2300, "comments": 310, "shares": 240, "saves": 410, "watch_time": 31000, "reach": 33000, "published_date": "2026-09-03"},
]

AUDIENCES = [
    {"id": 1, "creator_id": 1, "platform": "YouTube", "followers": 89900, "reach": 120000, "impressions": 200000, "gender": "Male 62% / Female 38%", "age_group": "25-34", "country": "India", "city": "Bengaluru", "device_type": "Desktop"},
    {"id": 2, "creator_id": 1, "platform": "YouTube", "followers": 34200, "reach": 48000, "impressions": 78000, "gender": "Male 58% / Female 42%", "age_group": "18-24", "country": "United States", "city": "San Francisco", "device_type": "Desktop"},
    {"id": 3, "creator_id": 1, "platform": "YouTube", "followers": 21500, "reach": 29000, "impressions": 46000, "gender": "Male 65% / Female 35%", "age_group": "35-44", "country": "Germany", "city": "Berlin", "device_type": "Desktop"},
    {"id": 4, "creator_id": 1, "platform": "Instagram", "followers": 80300, "reach": 112000, "impressions": 170000, "gender": "Female 54% / Male 46%", "age_group": "18-24", "country": "United States", "city": "New York", "device_type": "Mobile"},
    {"id": 5, "creator_id": 1, "platform": "Instagram", "followers": 62400, "reach": 89000, "impressions": 134000, "gender": "Female 52% / Male 48%", "age_group": "25-34", "country": "India", "city": "Mumbai", "device_type": "Mobile"},
    {"id": 6, "creator_id": 1, "platform": "Instagram", "followers": 28900, "reach": 41000, "impressions": 62000, "gender": "Female 58% / Male 42%", "age_group": "18-24", "country": "United Kingdom", "city": "London", "device_type": "Mobile"},
    {"id": 7, "creator_id": 1, "platform": "TikTok", "followers": 78500, "reach": 142000, "impressions": 210000, "gender": "Female 58% / Male 42%", "age_group": "18-24", "country": "United States", "city": "Los Angeles", "device_type": "Mobile"},
    {"id": 8, "creator_id": 1, "platform": "TikTok", "followers": 54200, "reach": 98000, "impressions": 148000, "gender": "Female 61% / Male 39%", "age_group": "18-24", "country": "Canada", "city": "Toronto", "device_type": "Mobile"},
    {"id": 9, "creator_id": 1, "platform": "TikTok", "followers": 36800, "reach": 64000, "impressions": 98000, "gender": "Male 50% / Female 50%", "age_group": "25-34", "country": "Australia", "city": "Sydney", "device_type": "Mobile"},
    {"id": 10, "creator_id": 1, "platform": "LinkedIn", "followers": 38200, "reach": 58000, "impressions": 89000, "gender": "Male 68% / Female 32%", "age_group": "25-34", "country": "India", "city": "Hyderabad", "device_type": "Desktop"},
    {"id": 11, "creator_id": 1, "platform": "LinkedIn", "followers": 24600, "reach": 39000, "impressions": 59000, "gender": "Male 64% / Female 36%", "age_group": "35-44", "country": "United States", "city": "Austin", "device_type": "Desktop"},
    {"id": 12, "creator_id": 1, "platform": "LinkedIn", "followers": 15800, "reach": 25000, "impressions": 38000, "gender": "Male 70% / Female 30%", "age_group": "25-34", "country": "Singapore", "city": "Singapore", "device_type": "Desktop"},
    {"id": 13, "creator_id": 1, "platform": "X", "followers": 29400, "reach": 56000, "impressions": 84000, "gender": "Male 75% / Female 25%", "age_group": "25-34", "country": "United States", "city": "San Francisco", "device_type": "Mobile"},
    {"id": 14, "creator_id": 1, "platform": "X", "followers": 18500, "reach": 35000, "impressions": 53000, "gender": "Male 72% / Female 28%", "age_group": "18-24", "country": "India", "city": "Pune", "device_type": "Mobile"},
    {"id": 15, "creator_id": 1, "platform": "X", "followers": 11200, "reach": 22000, "impressions": 34000, "gender": "Male 78% / Female 22%", "age_group": "25-34", "country": "United Kingdom", "city": "Manchester", "device_type": "Mobile"},
    {"id": 16, "creator_id": 1, "platform": "Facebook", "followers": 32400, "reach": 48000, "impressions": 72000, "gender": "Male 52% / Female 48%", "age_group": "35-44", "country": "India", "city": "Chennai", "device_type": "Mobile"},
    {"id": 17, "creator_id": 1, "platform": "Facebook", "followers": 21800, "reach": 32000, "impressions": 48000, "gender": "Female 51% / Male 49%", "age_group": "25-34", "country": "United States", "city": "Chicago", "device_type": "Mobile"},
    {"id": 18, "creator_id": 1, "platform": "Facebook", "followers": 14500, "reach": 21000, "impressions": 31000, "gender": "Male 55% / Female 45%", "age_group": "45-54", "country": "Philippines", "city": "Manila", "device_type": "Mobile"},
]

GROWTHS = [
    {"id": 1, "creator_id": 1, "date": "2026-07-01", "followers": 142000, "reach": 185000},
    {"id": 2, "creator_id": 1, "date": "2026-07-15", "followers": 165000, "reach": 210000},
    {"id": 3, "creator_id": 1, "date": "2026-08-01", "followers": 185000, "reach": 240000},
    {"id": 4, "creator_id": 1, "date": "2026-08-05", "followers": 198000, "reach": 264000},
    {"id": 5, "creator_id": 1, "date": "2026-08-10", "followers": 212000, "reach": 289000},
    {"id": 6, "creator_id": 1, "date": "2026-08-15", "followers": 228500, "reach": 315000},
    {"id": 7, "creator_id": 1, "date": "2026-08-20", "followers": 246000, "reach": 342000},
    {"id": 8, "creator_id": 1, "date": "2026-08-25", "followers": 268000, "reach": 378000},
    {"id": 9, "creator_id": 1, "date": "2026-08-30", "followers": 294000, "reach": 420000},
    {"id": 10, "creator_id": 1, "date": "2026-09-01", "followers": 315000, "reach": 465000},
    {"id": 11, "creator_id": 1, "date": "2026-09-03", "followers": 348000, "reach": 520000},
]

REVENUES = [
    {"id": 1, "creator_id": 1, "platform": "YouTube", "amount": 45000, "revenue_date": "2026-08-01", "source": "YouTube AdSense", "description": "August Monthly Video Monetization Payout"},
    {"id": 2, "creator_id": 1, "platform": "YouTube", "amount": 60000, "revenue_date": "2026-08-12", "source": "Brand Sponsorship", "description": "DevTools Pro Summer Video Integration"},
    {"id": 3, "creator_id": 1, "platform": "Instagram", "amount": 35000, "revenue_date": "2026-08-15", "source": "Brand Sponsorship", "description": "ErgoChair Tech Reel & Story Feature"},
    {"id": 4, "creator_id": 1, "platform": "Multi-Platform", "amount": 18500, "revenue_date": "2026-08-18", "source": "Affiliate Marketing", "description": "Hardware & IDE Extension Commissions"},
    {"id": 5, "creator_id": 1, "platform": "TikTok", "amount": 28000, "revenue_date": "2026-08-22", "source": "Brand Sponsorship", "description": "CloudScale Hosting TikTok Showcase Series"},
    {"id": 6, "creator_id": 1, "platform": "Multi-Platform", "amount": 25000, "revenue_date": "2026-08-25", "source": "Course Sales", "description": "Full Stack Creator Bootcamp Downloads"},
    {"id": 7, "creator_id": 1, "platform": "LinkedIn", "amount": 40000, "revenue_date": "2026-09-01", "source": "Consulting & B2B", "description": "Enterprise Tech Architecture Advisory"},
    {"id": 8, "creator_id": 1, "platform": "Instagram", "amount": 48000, "revenue_date": "2026-09-01", "source": "Brand Sponsorship", "description": "AudioTech Pro Wireless Studio Feature"},
    {"id": 9, "creator_id": 1, "platform": "TikTok", "amount": 32000, "revenue_date": "2026-09-02", "source": "Creator Rewards", "description": "TikTok Creator Rewards Program Viral Payout"},
    {"id": 10, "creator_id": 1, "platform": "X", "amount": 15000, "revenue_date": "2026-09-02", "source": "Subscriptions & Tips", "description": "X Super Follows & Monetized Thread Series"},
    {"id": 11, "creator_id": 1, "platform": "Facebook", "amount": 22000, "revenue_date": "2026-09-03", "source": "Meta In-Stream Ads", "description": "Facebook Stars & In-Stream Video Ad Revenue"},
]

SPONSORSHIPS = [
    {"id": 1, "creator_id": 1, "platform": "YouTube", "brand_name": "DevTools Pro", "campaign": "Summer Dev Kit Launch", "contract_value": 60000, "start_date": "2026-08-01", "end_date": "2026-08-31", "status": "Active", "payment_status": "Paid"},
    {"id": 2, "creator_id": 1, "platform": "Instagram", "brand_name": "ErgoChair Tech", "campaign": "Product Showcase Reel & Carousel", "contract_value": 35000, "start_date": "2026-08-10", "end_date": "2026-09-10", "status": "Active", "payment_status": "Paid"},
    {"id": 3, "creator_id": 1, "platform": "TikTok", "brand_name": "CloudScale Hosting", "campaign": "Serverless Platform Awareness", "contract_value": 28000, "start_date": "2026-08-15", "end_date": "2026-09-15", "status": "Active", "payment_status": "Pending"},
    {"id": 4, "creator_id": 1, "platform": "LinkedIn", "brand_name": "Enterprise SaaS Co", "campaign": "Executive B2B Tech Series", "contract_value": 40000, "start_date": "2026-09-01", "end_date": "2026-09-30", "status": "Active", "payment_status": "Pending"},
    {"id": 5, "creator_id": 1, "platform": "Instagram", "brand_name": "AudioTech Pro", "campaign": "Wireless Studio Audio Equipment", "contract_value": 48000, "start_date": "2026-09-01", "end_date": "2026-09-25", "status": "Active", "payment_status": "Paid"},
    {"id": 6, "creator_id": 1, "platform": "TikTok", "brand_name": "Voxel AI", "campaign": "Generative UI Code Assistant Challenge", "contract_value": 38000, "start_date": "2026-09-02", "end_date": "2026-09-28", "status": "Active", "payment_status": "Pending"},
    {"id": 7, "creator_id": 1, "platform": "X", "brand_name": "SecureCode Vault", "campaign": "DevSecOps Awareness Thread Series", "contract_value": 18000, "start_date": "2026-09-03", "end_date": "2026-09-18", "status": "Active", "payment_status": "Paid"},
]

NOTIFICATIONS = [
    {"id": 1, "creator_id": 1, "notification_type": "performance", "title": "Viral Content Alert (TikTok)", "message": "Content 'How APIs Actually Talk to Databases' exploded to 142,000 views and 21,500 likes!", "is_read": False, "created_at": datetime.now().isoformat()},
    {"id": 2, "creator_id": 1, "notification_type": "growth", "title": "Major Multi-Platform Milestone", "message": "Congratulations! Your combined multi-platform audience crossed 348,000 followers.", "is_read": False, "created_at": datetime.now().isoformat()},
    {"id": 3, "creator_id": 1, "notification_type": "revenue", "title": "Sponsorship Payout Confirmed", "message": "Brand sponsorship payment of ₹48,000 cleared from AudioTech Pro.", "is_read": False, "created_at": datetime.now().isoformat()},
    {"id": 4, "creator_id": 1, "notification_type": "engagement", "title": "Instagram Engagement Spike", "message": "Instagram Reels engagement reached 15.8% this week with over 10,000 saves.", "is_read": True, "created_at": datetime.now().isoformat()},
    {"id": 5, "creator_id": 1, "notification_type": "performance", "title": "High LinkedIn Reach", "message": "LinkedIn post 'How We Cut Cloud Infrastructure Costs' reached 41,500 professionals.", "is_read": True, "created_at": datetime.now().isoformat()},
]

# ==========================================
# Pydantic Request & Response Schemas
# ==========================================

class UserLogin(BaseModel):
    email: EmailStr = Field(default="monika@example.com", description="Creator login email")
    password: str = Field(default="password123", description="Creator password")

class UserRegister(BaseModel):
    full_name: str
    email: EmailStr
    password: str
    role: Optional[str] = "Creator"

class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    email: Optional[EmailStr] = None
    role: Optional[str] = None

class ContentCreate(BaseModel):
    platform: str
    content_title: str
    views: Optional[int] = 0
    likes: Optional[int] = 0
    comments: Optional[int] = 0
    shares: Optional[int] = 0
    reach: Optional[int] = 0

class AudienceCreate(BaseModel):
    platform: str
    followers: int
    reach: int
    impressions: int
    gender: str
    age_group: str
    country: str
    city: str
    device_type: str

class RevenueCreate(BaseModel):
    platform: str
    amount: float
    source: str
    description: str

class GrowthCreate(BaseModel):
    platform: str
    followers: int
    reach: int

class SponsorshipCreate(BaseModel):
    platform: str
    brand_name: str
    campaign: str
    contract_value: float
    start_date: str
    end_date: str
    status: Optional[str] = "Active"
    payment_status: Optional[str] = "Pending"

class NotificationCreate(BaseModel):
    notification_type: str
    title: str
    message: str

# ==========================================
# Standard JWT Token Generator
# ==========================================

def generate_jwt_token(payload: dict, secret: str = "supersecretjwtkey_creatoriq_2026") -> str:
    header = {"alg": "HS256", "typ": "JWT"}
    
    def b64url(data: bytes) -> str:
        return base64.urlsafe_b64encode(data).decode('utf-8').rstrip('=')
    
    encoded_header = b64url(json.dumps(header).encode('utf-8'))
    encoded_payload = b64url(json.dumps(payload).encode('utf-8'))
    
    signature = hmac.new(
        secret.encode('utf-8'),
        f"{encoded_header}.{encoded_payload}".encode('utf-8'),
        hashlib.sha256
    ).digest()
    
    encoded_signature = b64url(signature)
    return f"{encoded_header}.{encoded_payload}.{encoded_signature}"

def compute_platform_comparison(creator_id: int = 1):
    platform_names = ["YouTube", "Instagram", "TikTok", "LinkedIn", "X", "Facebook"]
    result = []
    for p in platform_names:
        p_content = [c for c in CONTENTS if c["creator_id"] == creator_id and (c.get("platform") or "").lower() == p.lower()]
        total_views = sum(c.get("views", 0) for c in p_content)
        total_likes = sum(c.get("likes", 0) for c in p_content)
        total_comments = sum(c.get("comments", 0) for c in p_content)
        total_shares = sum(c.get("shares", 0) for c in p_content)
        total_reach = sum(c.get("reach", 0) for c in p_content)
        total_engagement = total_likes + total_comments + total_shares
        engagement_rate = round((total_engagement / total_reach * 100), 2) if total_reach > 0 else 0.0
        result.append({
            "platform": p,
            "content_count": len(p_content),
            "total_views": total_views,
            "total_likes": total_likes,
            "total_comments": total_comments,
            "total_shares": total_shares,
            "total_reach": total_reach,
            "engagement_rate": engagement_rate
        })
    result.sort(key=lambda x: x["engagement_rate"], reverse=True)
    return result

# =======================================================
# 1. default (Users, Search, Auth Login/Register/Me, Home)
# =======================================================

@app.get("/", tags=["default"], summary="Home")
def root_endpoint():
    return {"message": "CreatorIQ Multi-Platform Engine Live", "docs": "/docs"}

@app.get("/users", tags=["default"], summary="Get Users")
def get_users_default():
    return USERS

@app.post("/users", tags=["default"], summary="Create User")
def create_user_default(user: UserRegister):
    new_u = {"id": len(USERS) + 1, "full_name": user.full_name, "email": user.email, "role": user.role or "Creator"}
    USERS.append(new_u)
    return new_u

@app.get("/users/search", tags=["default"], summary="Search Users")
def search_users_default(q: Optional[str] = Query(None)):
    if not q: return USERS
    return [u for u in USERS if q.lower() in u["full_name"].lower() or q.lower() in u["email"].lower()]

@app.get("/users/{user_id}", tags=["default"], summary="Get User")
def get_user_default(user_id: int):
    user = next((u for u in USERS if u["id"] == user_id), None)
    if not user: raise HTTPException(status_code=404, detail="User not found")
    return user

@app.put("/users/{user_id}", tags=["default"], summary="Update User")
def update_user_default(user_id: int, user_update: UserUpdate):
    idx = next((i for i, u in enumerate(USERS) if u["id"] == user_id), None)
    if idx is None: raise HTTPException(status_code=404, detail="User not found")
    if user_update.full_name: USERS[idx]["full_name"] = user_update.full_name
    if user_update.email: USERS[idx]["email"] = user_update.email
    if user_update.role: USERS[idx]["role"] = user_update.role
    return USERS[idx]

@app.delete("/users/{user_id}", tags=["default"], summary="Delete User")
def delete_user_default(user_id: int):
    global USERS
    USERS = [u for u in USERS if u["id"] != user_id]
    return {"message": "User deleted"}

@app.post("/auth/register", tags=["default"], summary="Register")
def auth_register_default(user_data: UserRegister):
    new_user = {
        "id": len(USERS) + 1,
        "full_name": user_data.full_name,
        "email": user_data.email,
        "role": user_data.role or "Creator"
    }
    USERS.append(new_user)
    return {"message": "User registered successfully", "user": new_user}

@app.post("/auth/login", tags=["default"], summary="Login")
def auth_login_default(credentials: UserLogin):
    user = next((u for u in USERS if u["email"].lower() == credentials.email.lower()), None)
    if not user or credentials.password != "password123":
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    token = generate_jwt_token({
        "sub": user["email"],
        "id": user["id"],
        "name": user["full_name"],
        "role": user["role"],
        "iat": int(datetime.utcnow().timestamp()),
        "exp": int(datetime.utcnow().timestamp()) + 86400 * 30
    })
    
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": user
    }

@app.get("/auth/me", tags=["default"], summary="Get Me")
def auth_me_default():
    return USERS[0]

# =======================================================
# 2. content
# =======================================================
@app.get("/content", tags=["content"], summary="Get All Content")
def list_content_tag(platform: Optional[str] = Query(None)):
    if platform and platform not in ["All", "All Platforms"]:
        return [c for c in CONTENTS if (c.get("platform") or "").lower() == platform.lower()]
    return CONTENTS

@app.post("/content", tags=["content"], summary="Create Content")
def create_content_tag(item: ContentCreate):
    new_c = {"id": len(CONTENTS) + 1, "creator_id": 1, **item.dict(), "published_date": datetime.now().strftime("%Y-%m-%d")}
    CONTENTS.append(new_c)
    return new_c

@app.get("/content/{content_id}", tags=["content"], summary="Get Content Item")
def get_content_item_tag(content_id: int):
    item = next((c for c in CONTENTS if c["id"] == content_id), None)
    if not item: raise HTTPException(status_code=404, detail="Content not found")
    return item

@app.put("/content/{content_id}", tags=["content"], summary="Update Content Item")
def update_content_item_tag(content_id: int, item: ContentCreate):
    idx = next((i for i, c in enumerate(CONTENTS) if c["id"] == content_id), None)
    if idx is None: raise HTTPException(status_code=404, detail="Content not found")
    CONTENTS[idx].update(item.dict())
    return CONTENTS[idx]

@app.delete("/content/{content_id}", tags=["content"], summary="Delete Content Item")
def delete_content_item_tag(content_id: int):
    global CONTENTS
    CONTENTS = [c for c in CONTENTS if c["id"] != content_id]
    return {"message": "Content deleted successfully"}

# =======================================================
# 3. analytics
# =======================================================
@app.get("/analytics/summary", tags=["analytics"], summary="Dashboard Summary")
def get_analytics_summary_tag(platform: Optional[str] = Query(None)):
    filtered = CONTENTS
    if platform and platform not in ["All", "All Platforms"]:
        filtered = [c for c in CONTENTS if (c.get("platform") or "").lower() == platform.lower()]
    return {
        "total_views": sum(c.get("views", 0) for c in filtered),
        "total_likes": sum(c.get("likes", 0) for c in filtered),
        "total_comments": sum(c.get("comments", 0) for c in filtered),
        "total_shares": sum(c.get("shares", 0) for c in filtered),
        "total_reach": sum(c.get("reach", 0) for c in filtered),
        "total_revenue": sum(r.get("amount", 0) for r in REVENUES),
    }

@app.get("/analytics/top-content", tags=["analytics"], summary="Top Performing Content")
def get_top_content_tag(limit: int = 5):
    sorted_c = sorted(CONTENTS, key=lambda x: x.get("views", 0), reverse=True)
    return sorted_c[:limit]

@app.get("/analytics/platform-performance", tags=["analytics"], summary="Platform Performance")
def get_platform_performance_tag():
    return compute_platform_comparison(1)

@app.get("/analytics/platform-comparison", tags=["analytics"], summary="Platform Comparison")
def get_platform_comparison_tag():
    return compute_platform_comparison(1)

@app.get("/analytics/chart/engagement", tags=["analytics"], summary="Engagement Chart")
def get_engagement_chart_tag():
    return [
        {"name": c["content_title"][:15], "engagement": round((c["likes"] + c["comments"] + c["shares"]) / (c["reach"] or 1) * 100, 2)}
        for c in CONTENTS[:10]
    ]

@app.get("/analytics/chart/followers", tags=["analytics"], summary="Follower Growth Chart")
def get_follower_growth_chart_tag():
    return GROWTHS

@app.get("/analytics/content/{content_id}/engagement", tags=["analytics"], summary="Content Engagement")
def get_single_content_engagement_tag(content_id: int):
    item = next((c for c in CONTENTS if c["id"] == content_id), None)
    if not item: raise HTTPException(status_code=404, detail="Content not found")
    rate = round((item["likes"] + item["comments"] + item["shares"]) / (item["reach"] or 1) * 100, 2)
    return {"content_id": content_id, "engagement_rate": rate}

@app.get("/analytics/audience", tags=["analytics"], summary="Audience Analytics")
def get_analytics_audience_tag():
    return AUDIENCES

@app.get("/analytics/growth", tags=["analytics"], summary="Follower Growth Analytics")
def get_analytics_growth_tag():
    return GROWTHS

# =======================================================
# 4. audience
# =======================================================
@app.get("/audience", tags=["audience"], summary="Get Audience Demographics")
def list_audience_tag(platform: Optional[str] = Query(None)):
    if platform and platform not in ["All", "All Platforms"]:
        return [a for a in AUDIENCES if (a.get("platform") or "").lower() == platform.lower()]
    return AUDIENCES

@app.post("/audience", tags=["audience"], summary="Create Audience Segment")
def create_audience_tag(item: AudienceCreate):
    new_a = {"id": len(AUDIENCES) + 1, "creator_id": 1, **item.dict()}
    AUDIENCES.append(new_a)
    return new_a

@app.get("/audience/{audience_id}", tags=["audience"], summary="Get Audience Segment")
def get_audience_item_tag(audience_id: int):
    item = next((a for a in AUDIENCES if a["id"] == audience_id), None)
    if not item: raise HTTPException(status_code=404, detail="Audience segment not found")
    return item

@app.put("/audience/{audience_id}", tags=["audience"], summary="Update Audience Segment")
def update_audience_item_tag(audience_id: int, item: AudienceCreate):
    idx = next((i for i, a in enumerate(AUDIENCES) if a["id"] == audience_id), None)
    if idx is None: raise HTTPException(status_code=404, detail="Audience not found")
    AUDIENCES[idx].update(item.dict())
    return AUDIENCES[idx]

@app.delete("/audience/{audience_id}", tags=["audience"], summary="Delete Audience Segment")
def delete_audience_item_tag(audience_id: int):
    global AUDIENCES
    AUDIENCES = [a for a in AUDIENCES if a["id"] != audience_id]
    return {"message": "Audience segment deleted"}

# =======================================================
# 5. social media
# =======================================================
@app.get("/social-media/platforms", tags=["social media"], summary="List Connected Social Media Platforms")
def get_social_media_platforms():
    return [
        {"platform": "YouTube", "connected": True, "handle": "@monikacreator"},
        {"platform": "Instagram", "connected": True, "handle": "@monika_dev"},
        {"platform": "TikTok", "connected": True, "handle": "@monikacodes"},
        {"platform": "LinkedIn", "connected": True, "handle": "Monika Chowdary"},
        {"platform": "X", "connected": True, "handle": "@monika_tweets"},
        {"platform": "Facebook", "connected": True, "handle": "Monika Tech Community"}
    ]

@app.get("/social-media/sync", tags=["social media"], summary="Sync Multi-Platform Data")
def sync_social_media():
    return {"status": "success", "synced_channels": 6, "synced_posts": 46, "last_synced": datetime.now().isoformat()}

@app.get("/youtube/sync", tags=["social media"], summary="Sync Live YouTube Telemetry")
def sync_youtube_tag():
    return {"status": "success", "synced_videos": 7, "channel": "@monikacreator", "last_synced": datetime.now().isoformat()}

@app.get("/youtube/channel", tags=["social media"], summary="Get YouTube Channel Profile")
def get_youtube_channel_tag():
    return {"channel_id": "UC_monikacreator", "title": "Monika Tech", "subscribers": 89900, "videos": 7}

@app.get("/youtube/videos", tags=["social media"], summary="List YouTube Synced Videos")
def get_youtube_videos_tag():
    return [c for c in CONTENTS if c.get("platform") == "YouTube"]

# =======================================================
# 6. revenue
# =======================================================
@app.get("/revenue", tags=["revenue"], summary="Get Revenue Payouts")
def list_revenue_tag(platform: Optional[str] = Query(None)):
    if platform and platform not in ["All", "All Platforms"]:
        return [r for r in REVENUES if (r.get("platform") or "").lower() == platform.lower() or r.get("platform") == "Multi-Platform"]
    return REVENUES

@app.post("/revenue", tags=["revenue"], summary="Record Revenue Payout")
def create_revenue_tag(item: RevenueCreate):
    new_r = {"id": len(REVENUES) + 1, "creator_id": 1, **item.dict(), "revenue_date": datetime.now().strftime("%Y-%m-%d")}
    REVENUES.append(new_r)
    return new_r

@app.get("/revenue/{revenue_id}", tags=["revenue"], summary="Get Revenue Item")
def get_revenue_item_tag(revenue_id: int):
    item = next((r for r in REVENUES if r["id"] == revenue_id), None)
    if not item: raise HTTPException(status_code=404, detail="Revenue not found")
    return item

@app.put("/revenue/{revenue_id}", tags=["revenue"], summary="Update Revenue Item")
def update_revenue_item_tag(revenue_id: int, item: RevenueCreate):
    idx = next((i for i, r in enumerate(REVENUES) if r["id"] == revenue_id), None)
    if idx is None: raise HTTPException(status_code=404, detail="Revenue not found")
    REVENUES[idx].update(item.dict())
    return REVENUES[idx]

@app.delete("/revenue/{revenue_id}", tags=["revenue"], summary="Delete Revenue Item")
def delete_revenue_item_tag(revenue_id: int):
    global REVENUES
    REVENUES = [r for r in REVENUES if r["id"] != revenue_id]
    return {"message": "Revenue record deleted"}

# =======================================================
# 7. sponsorships
# =======================================================
@app.get("/sponsorships", tags=["sponsorships"], summary="Get All Sponsorship Deals")
def list_sponsorships_tag():
    return SPONSORSHIPS

@app.post("/sponsorships", tags=["sponsorships"], summary="Create Sponsorship Deal")
def create_sponsorship_tag(item: SponsorshipCreate):
    new_s = {"id": len(SPONSORSHIPS) + 1, "creator_id": 1, **item.dict()}
    SPONSORSHIPS.append(new_s)
    return new_s

@app.get("/sponsorships/{sponsorship_id}", tags=["sponsorships"], summary="Get Sponsorship Deal")
def get_sponsorship_item_tag(sponsorship_id: int):
    item = next((s for s in SPONSORSHIPS if s["id"] == sponsorship_id), None)
    if not item: raise HTTPException(status_code=404, detail="Sponsorship not found")
    return item

@app.put("/sponsorships/{sponsorship_id}", tags=["sponsorships"], summary="Update Sponsorship Deal")
def update_sponsorship_item_tag(sponsorship_id: int, item: SponsorshipCreate):
    idx = next((i for i, s in enumerate(SPONSORSHIPS) if s["id"] == sponsorship_id), None)
    if idx is None: raise HTTPException(status_code=404, detail="Sponsorship not found")
    SPONSORSHIPS[idx].update(item.dict())
    return SPONSORSHIPS[idx]

@app.delete("/sponsorships/{sponsorship_id}", tags=["sponsorships"], summary="Delete Sponsorship Deal")
def delete_sponsorship_item_tag(sponsorship_id: int):
    global SPONSORSHIPS
    SPONSORSHIPS = [s for s in SPONSORSHIPS if s["id"] != sponsorship_id]
    return {"message": "Sponsorship deleted"}

# =======================================================
# 8. notifications
# =======================================================
@app.get("/notifications", tags=["notifications"], summary="Get All Notifications")
def list_notifications_tag():
    return NOTIFICATIONS

@app.post("/notifications", tags=["notifications"], summary="Create Notification")
def create_notification_tag(item: NotificationCreate):
    new_n = {"id": len(NOTIFICATIONS) + 1, "creator_id": 1, **item.dict(), "is_read": False, "created_at": datetime.now().isoformat()}
    NOTIFICATIONS.append(new_n)
    return new_n

@app.get("/notifications/{notification_id}", tags=["notifications"], summary="Get Notification")
def get_notification_item_tag(notification_id: int):
    item = next((n for n in NOTIFICATIONS if n["id"] == notification_id), None)
    if not item: raise HTTPException(status_code=404, detail="Notification not found")
    return item

@app.put("/notifications/{notification_id}", tags=["notifications"], summary="Update Notification")
def update_notification_item_tag(notification_id: int, item: NotificationCreate):
    idx = next((i for i, n in enumerate(NOTIFICATIONS) if n["id"] == notification_id), None)
    if idx is None: raise HTTPException(status_code=404, detail="Notification not found")
    NOTIFICATIONS[idx].update(item.dict())
    return NOTIFICATIONS[idx]

@app.delete("/notifications/{notification_id}", tags=["notifications"], summary="Delete Notification")
def delete_notification_item_tag(notification_id: int):
    global NOTIFICATIONS
    NOTIFICATIONS = [n for n in NOTIFICATIONS if n["id"] != notification_id]
    return {"message": "Notification deleted"}

@app.put("/notifications/{notification_id}/read", tags=["notifications"], summary="Mark Notification As Read")
def mark_notification_read_tag(notification_id: int):
    item = next((n for n in NOTIFICATIONS if n["id"] == notification_id), None)
    if not item: raise HTTPException(status_code=404, detail="Notification not found")
    item["is_read"] = True
    return item

# =======================================================
# 9. reports
# =======================================================
@app.get("/reports", tags=["reports"], summary="Get Creator Performance Report")
def get_reports_tag():
    return {
        "creator_id": 1,
        "platform_filter": "All",
        "generated_at": datetime.now().isoformat(),
        "total_records": len(CONTENTS),
        "content_performance": {
            "total_content": len(CONTENTS),
            "total_records": len(CONTENTS),
            "total_views": sum(c.get("views", 0) for c in CONTENTS),
            "total_likes": sum(c.get("likes", 0) for c in CONTENTS),
            "total_comments": sum(c.get("comments", 0) for c in CONTENTS),
            "total_shares": sum(c.get("shares", 0) for c in CONTENTS),
            "total_reach": sum(c.get("reach", 0) for c in CONTENTS),
            "content": CONTENTS
        },
        "revenue_analytics": {
            "total_revenue": sum(r.get("amount", 0) for r in REVENUES),
            "total_records": len(REVENUES),
            "data": REVENUES
        },
        "platform_comparison": compute_platform_comparison(1),
        "sponsorships": {
            "total_records": len(SPONSORSHIPS),
            "data": SPONSORSHIPS
        }
    }

@app.get("/reports/content", tags=["reports"], summary="Get Content")
def get_content_report_tag():
    return {
        "creator_id": 1,
        "total_records": len(CONTENTS),
        "total_content": len(CONTENTS),
        "total_views": sum(c.get("views", 0) for c in CONTENTS),
        "total_likes": sum(c.get("likes", 0) for c in CONTENTS),
        "total_comments": sum(c.get("comments", 0) for c in CONTENTS),
        "total_shares": sum(c.get("shares", 0) for c in CONTENTS),
        "total_reach": sum(c.get("reach", 0) for c in CONTENTS),
        "data": CONTENTS,
        "content": CONTENTS
    }

@app.get("/reports/audience", tags=["reports"], summary="Get Audience Demographics Report")
def get_audience_report_tag():
    return {
        "creator_id": 1,
        "total_records": len(AUDIENCES),
        "total_followers": sum(a.get("followers", 0) for a in AUDIENCES),
        "total_reach": sum(a.get("reach", 0) for a in AUDIENCES),
        "total_impressions": sum(a.get("impressions", 0) for a in AUDIENCES),
        "data": AUDIENCES
    }

@app.get("/reports/revenue", tags=["reports"], summary="Get Revenue Analytics Report")
def get_revenue_report_tag():
    return {
        "creator_id": 1,
        "total_records": len(REVENUES),
        "total_revenue": sum(r.get("amount", 0) for r in REVENUES),
        "data": REVENUES
    }

@app.get("/reports/growth", tags=["reports"], summary="Get Audience Growth Report")
def get_growth_report_tag(platform: Optional[str] = None):
    return {
        "creator_id": 1,
        "total_records": len(GROWTHS),
        "data": GROWTHS
    }

@app.get("/reports/platforms", tags=["reports"], summary="Get Platform Comparison Report")
def get_platforms_report_tag():
    return {
        "creator_id": 1,
        "total_platforms": 6,
        "data": compute_platform_comparison(1)
    }

@app.get("/reports/export/pdf", tags=["reports"], summary="Export Performance PDF Report")
def export_pdf_report_tag():
    return Response(content=b"%PDF-1.4 Mock PDF Stream", media_type="application/pdf", headers={"Content-Disposition": "attachment; filename=creator_report.pdf"})

@app.get("/reports/export/excel", tags=["reports"], summary="Export Performance Excel Report")
def export_excel_report_tag():
    return Response(content=b"Mock Excel Stream", media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", headers={"Content-Disposition": "attachment; filename=creator_report.xlsx"})

# =======================================================
# 10. roles & dashboard
# =======================================================
@app.get("/roles", tags=["roles"], summary="List Roles")
@app.get("/roles/", tags=["roles"], include_in_schema=False)
def list_roles_tag():
    return [
        {"id": 1, "name": "Creator", "description": "Full creator access to content, analytics, and revenue"},
        {"id": 2, "name": "Admin", "description": "System administrator with management capabilities"},
        {"id": 3, "name": "Brand Sponsor", "description": "Brand partner with sponsorship access"}
    ]

@app.get("/dashboard/overview", tags=["dashboard"], summary="Overview Dashboard Telemetry")
def dashboard_overview_tag():
    return {
        "creator": USERS[0],
        "total_views": sum(c.get("views", 0) for c in CONTENTS),
        "total_posts": len(CONTENTS),
        "connected_platforms": 6,
        "total_revenue": sum(r.get("amount", 0) for r in REVENUES)
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
