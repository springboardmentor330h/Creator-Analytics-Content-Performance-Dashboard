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
    {"id": 1, "creator_id": 1, "platform": "YouTube", "external_content_id": "yt_001", "content_title": "Full Stack React 19 & Node Tutorial 2026", "views": 45000, "likes": 3150, "comments": 252, "shares": 189, "saves": 567, "watch_time": 180000, "reach": 51749, "published_date": "2026-08-01"},
    {"id": 2, "creator_id": 1, "platform": "YouTube", "external_content_id": "yt_002", "content_title": "Top 10 Developer Productivity Hacks", "views": 76500, "likes": 7650, "comments": 765, "shares": 765, "saves": 1759, "watch_time": 306000, "reach": 87975, "published_date": "2026-08-02"},
    {"id": 3, "creator_id": 1, "platform": "YouTube", "external_content_id": "yt_003", "content_title": "Building Production Microservices with Node.js", "views": 108000, "likes": 8640, "comments": 691, "shares": 691, "saves": 1555, "watch_time": 432000, "reach": 124199, "published_date": "2026-08-03"},
    {"id": 4, "creator_id": 1, "platform": "YouTube", "external_content_id": "yt_004", "content_title": "System Design Deep Dive: Scaling to 1M Users", "views": 54000, "likes": 5940, "comments": 594, "shares": 356, "saves": 1366, "watch_time": 216000, "reach": 62099, "published_date": "2026-08-04"},
    {"id": 5, "creator_id": 1, "platform": "YouTube", "external_content_id": "yt_005", "content_title": "Complete PostgreSQL Architecture & Query Optimization", "views": 85500, "likes": 7695, "comments": 615, "shares": 769, "saves": 1385, "watch_time": 342000, "reach": 98324, "published_date": "2026-08-05"},
    {"id": 6, "creator_id": 1, "platform": "YouTube", "external_content_id": "yt_006", "content_title": "Docker & Kubernetes for Frontend Engineers", "views": 117000, "likes": 8190, "comments": 819, "shares": 655, "saves": 1883, "watch_time": 468000, "reach": 134550, "published_date": "2026-08-06"},
    {"id": 7, "creator_id": 1, "platform": "YouTube", "external_content_id": "yt_007", "content_title": "How to Build an AI Agent in 20 Minutes", "views": 62999, "likes": 6299, "comments": 503, "shares": 377, "saves": 1133, "watch_time": 251999, "reach": 72448, "published_date": "2026-08-07"},
    {"id": 8, "creator_id": 1, "platform": "YouTube", "external_content_id": "yt_008", "content_title": "Next.js 15 Server Actions & App Router Blueprint", "views": 94500, "likes": 7560, "comments": 756, "shares": 756, "saves": 1738, "watch_time": 378000, "reach": 108674, "published_date": "2026-08-08"},
    {"id": 9, "creator_id": 1, "platform": "YouTube", "external_content_id": "yt_009", "content_title": "GraphQL vs REST API in 2026: Definitive Guide", "views": 125999, "likes": 13859, "comments": 1108, "shares": 1108, "saves": 2494, "watch_time": 503999, "reach": 144898, "published_date": "2026-08-09"},
    {"id": 10, "creator_id": 1, "platform": "YouTube", "external_content_id": "yt_010", "content_title": "Mastering TypeScript Generics & Type Guards", "views": 72000, "likes": 6480, "comments": 648, "shares": 388, "saves": 1490, "watch_time": 288000, "reach": 82800, "published_date": "2026-08-10"},
    {"id": 11, "creator_id": 1, "platform": "YouTube", "external_content_id": "yt_011", "content_title": "Redis Caching Strategies for High Traffic APIs", "views": 103499, "likes": 7244, "comments": 579, "shares": 724, "saves": 1303, "watch_time": 413999, "reach": 119023, "published_date": "2026-08-11"},
    {"id": 12, "creator_id": 1, "platform": "YouTube", "external_content_id": "yt_012", "content_title": "AWS Serverless Architecture Course (Lambda, SQS, DynamoDB)", "views": 49500, "likes": 4950, "comments": 495, "shares": 396, "saves": 1138, "watch_time": 198000, "reach": 56924, "published_date": "2026-08-12"},
    {"id": 13, "creator_id": 1, "platform": "YouTube", "external_content_id": "yt_013", "content_title": "Python FastAPI & Pydantic v2 Crash Course", "views": 81000, "likes": 6480, "comments": 518, "shares": 388, "saves": 1166, "watch_time": 324000, "reach": 93150, "published_date": "2026-08-13"},
    {"id": 14, "creator_id": 1, "platform": "YouTube", "external_content_id": "yt_014", "content_title": "Web Security Essentials: OAuth2, JWT & CORS", "views": 112500, "likes": 12375, "comments": 1237, "shares": 1237, "saves": 2846, "watch_time": 450000, "reach": 129374, "published_date": "2026-08-14"},
    {"id": 15, "creator_id": 1, "platform": "YouTube", "external_content_id": "yt_015", "content_title": "CI/CD Pipeline Automation with GitHub Actions", "views": 58500, "likes": 5265, "comments": 421, "shares": 421, "saves": 947, "watch_time": 234000, "reach": 67275, "published_date": "2026-08-15"},
    {"id": 16, "creator_id": 1, "platform": "YouTube", "external_content_id": "yt_016", "content_title": "Building Realtime Apps with WebSockets & Socket.io", "views": 90000, "likes": 6300, "comments": 630, "shares": 378, "saves": 1449, "watch_time": 360000, "reach": 103499, "published_date": "2026-08-16"},
    {"id": 17, "creator_id": 1, "platform": "YouTube", "external_content_id": "yt_017", "content_title": "Modern CSS Grid & Container Queries Masterclass", "views": 121500, "likes": 12150, "comments": 972, "shares": 1215, "saves": 2187, "watch_time": 486000, "reach": 139725, "published_date": "2026-08-17"},
    {"id": 18, "creator_id": 1, "platform": "YouTube", "external_content_id": "yt_018", "content_title": "AI Pair Programming with Antigravity & LLMs", "views": 67500, "likes": 5400, "comments": 540, "shares": 432, "saves": 1242, "watch_time": 270000, "reach": 77625, "published_date": "2026-08-18"},
    {"id": 19, "creator_id": 1, "platform": "YouTube", "external_content_id": "yt_019", "content_title": "Building High-Speed Realtime Analytics Engine", "views": 99000, "likes": 10890, "comments": 871, "shares": 653, "saves": 1960, "watch_time": 396000, "reach": 113849, "published_date": "2026-08-19"},
    {"id": 20, "creator_id": 1, "platform": "YouTube", "external_content_id": "yt_020", "content_title": "Go / Golang Microservices Architecture Guide", "views": 45000, "likes": 4050, "comments": 405, "shares": 405, "saves": 931, "watch_time": 180000, "reach": 51749, "published_date": "2026-08-20"},
    {"id": 21, "creator_id": 1, "platform": "YouTube", "external_content_id": "yt_021", "content_title": "Clean Code Principles Every Engineer Should Know", "views": 76500, "likes": 5355, "comments": 428, "shares": 428, "saves": 963, "watch_time": 306000, "reach": 87975, "published_date": "2026-08-21"},
    {"id": 22, "creator_id": 1, "platform": "YouTube", "external_content_id": "yt_022", "content_title": "Tailwind CSS v4 & Modern UI Architecture", "views": 108000, "likes": 10800, "comments": 1080, "shares": 648, "saves": 2484, "watch_time": 432000, "reach": 124199, "published_date": "2026-08-22"},
    {"id": 23, "creator_id": 1, "platform": "YouTube", "external_content_id": "yt_023", "content_title": "React Native vs Flutter for Mobile Dev 2026", "views": 54000, "likes": 4320, "comments": 345, "shares": 432, "saves": 777, "watch_time": 216000, "reach": 62099, "published_date": "2026-08-23"},
    {"id": 24, "creator_id": 1, "platform": "YouTube", "external_content_id": "yt_024", "content_title": "Understanding Kafka & Event Driven Streaming", "views": 85500, "likes": 9405, "comments": 940, "shares": 752, "saves": 2163, "watch_time": 342000, "reach": 98324, "published_date": "2026-08-24"},
    {"id": 25, "creator_id": 1, "platform": "YouTube", "external_content_id": "yt_025", "content_title": "How Search Engines Work Under the Hood", "views": 117000, "likes": 10530, "comments": 842, "shares": 631, "saves": 1895, "watch_time": 468000, "reach": 134550, "published_date": "2026-08-25"},
    {"id": 26, "creator_id": 1, "platform": "YouTube", "external_content_id": "yt_026", "content_title": "Complete ElasticSearch & Vector Search Crash Course", "views": 62999, "likes": 4409, "comments": 440, "shares": 440, "saves": 1014, "watch_time": 251999, "reach": 72448, "published_date": "2026-09-02"},
    {"id": 27, "creator_id": 1, "platform": "YouTube", "external_content_id": "yt_027", "content_title": "Rust for Web Developers: From Zero to Production", "views": 94500, "likes": 9450, "comments": 756, "shares": 756, "saves": 1701, "watch_time": 378000, "reach": 108674, "published_date": "2026-09-03"},
    {"id": 28, "creator_id": 1, "platform": "YouTube", "external_content_id": "yt_028", "content_title": "Building Custom Chrome Extensions with React", "views": 125999, "likes": 10079, "comments": 1007, "shares": 604, "saves": 2318, "watch_time": 503999, "reach": 144898, "published_date": "2026-09-04"},
    {"id": 29, "creator_id": 1, "platform": "YouTube", "external_content_id": "yt_029", "content_title": "Database Migration Strategies without Downtime", "views": 72000, "likes": 7920, "comments": 633, "shares": 792, "saves": 1425, "watch_time": 288000, "reach": 82800, "published_date": "2026-09-05"},
    {"id": 30, "creator_id": 1, "platform": "YouTube", "external_content_id": "yt_030", "content_title": "Automated Testing with Playwright & Vitest", "views": 103499, "likes": 9314, "comments": 931, "shares": 745, "saves": 2142, "watch_time": 413999, "reach": 119023, "published_date": "2026-09-01"},
    {"id": 31, "creator_id": 1, "platform": "YouTube", "external_content_id": "yt_031", "content_title": "Mastering Git Rebase, Bisect & Stash Tricks", "views": 49500, "likes": 3465, "comments": 277, "shares": 207, "saves": 623, "watch_time": 198000, "reach": 56924, "published_date": "2026-09-02"},
    {"id": 32, "creator_id": 1, "platform": "YouTube", "external_content_id": "yt_032", "content_title": "Micro Frontend Architecture in Enterprise SaaS", "views": 81000, "likes": 8100, "comments": 810, "shares": 810, "saves": 1862, "watch_time": 324000, "reach": 93150, "published_date": "2026-09-03"},
    {"id": 33, "creator_id": 1, "platform": "YouTube", "external_content_id": "yt_033", "content_title": "Building LLM RAG Applications with LangChain & LlamaIndex", "views": 112500, "likes": 9000, "comments": 720, "shares": 720, "saves": 1620, "watch_time": 450000, "reach": 129374, "published_date": "2026-09-04"},
    {"id": 34, "creator_id": 1, "platform": "YouTube", "external_content_id": "yt_034", "content_title": "Cloud Native Observability with Prometheus & Grafana", "views": 58500, "likes": 6435, "comments": 643, "shares": 386, "saves": 1480, "watch_time": 234000, "reach": 67275, "published_date": "2026-09-05"},
    {"id": 35, "creator_id": 1, "platform": "YouTube", "external_content_id": "yt_035", "content_title": "Full Stack SaaS App Launch Roadmap & Case Study", "views": 90000, "likes": 8100, "comments": 648, "shares": 810, "saves": 1458, "watch_time": 360000, "reach": 103499, "published_date": "2026-09-01"},
    {"id": 36, "creator_id": 1, "platform": "Instagram", "external_content_id": "ig_001", "content_title": "Minimalist Desk Setup Tour & Ergonomics Guide", "views": 35000, "likes": 2450, "comments": 196, "shares": 147, "saves": 441, "watch_time": 45000, "reach": 40250, "published_date": "2026-08-01"},
    {"id": 37, "creator_id": 1, "platform": "Instagram", "external_content_id": "ig_002", "content_title": "5 Modern CSS Tricks You Need in 2026", "views": 59500, "likes": 5950, "comments": 595, "shares": 595, "saves": 1368, "watch_time": 76500, "reach": 68425, "published_date": "2026-08-02"},
    {"id": 38, "creator_id": 1, "platform": "Instagram", "external_content_id": "ig_003", "content_title": "Day in the Life of a Senior Software Architect", "views": 84000, "likes": 6720, "comments": 537, "shares": 537, "saves": 1209, "watch_time": 108000, "reach": 96599, "published_date": "2026-08-03"},
    {"id": 39, "creator_id": 1, "platform": "Instagram", "external_content_id": "ig_004", "content_title": "Dark Mode UI Glassmorphism Tutorial Reel", "views": 42000, "likes": 4620, "comments": 462, "shares": 277, "saves": 1062, "watch_time": 54000, "reach": 48299, "published_date": "2026-08-04"},
    {"id": 40, "creator_id": 1, "platform": "Instagram", "external_content_id": "ig_005", "content_title": "Clean Code vs Spaghetti Code Comparison", "views": 66500, "likes": 5985, "comments": 478, "shares": 598, "saves": 1077, "watch_time": 85500, "reach": 76475, "published_date": "2026-08-05"},
    {"id": 41, "creator_id": 1, "platform": "Instagram", "external_content_id": "ig_006", "content_title": "My Ultimate Developer Morning Routine \u2615\ud83d\udcbb", "views": 91000, "likes": 6370, "comments": 637, "shares": 509, "saves": 1465, "watch_time": 117000, "reach": 104649, "published_date": "2026-08-06"},
    {"id": 42, "creator_id": 1, "platform": "Instagram", "external_content_id": "ig_007", "content_title": "Top 5 VS Code Extensions That Save 10 Hours/Week", "views": 49000, "likes": 4900, "comments": 392, "shares": 294, "saves": 882, "watch_time": 62999, "reach": 56349, "published_date": "2026-08-07"},
    {"id": 43, "creator_id": 1, "platform": "Instagram", "external_content_id": "ig_008", "content_title": "Interactive Carousel: JavaScript Event Loop Explained", "views": 73500, "likes": 5880, "comments": 588, "shares": 588, "saves": 1352, "watch_time": 94500, "reach": 84525, "published_date": "2026-08-08"},
    {"id": 44, "creator_id": 1, "platform": "Instagram", "external_content_id": "ig_009", "content_title": "Why I Switched from Mac to Custom Linux Rig", "views": 98000, "likes": 10780, "comments": 862, "shares": 862, "saves": 1940, "watch_time": 125999, "reach": 112699, "published_date": "2026-08-09"},
    {"id": 45, "creator_id": 1, "platform": "Instagram", "external_content_id": "ig_010", "content_title": "Tailwind v4 Cheat Sheet (Save This Post!)", "views": 56000, "likes": 5040, "comments": 504, "shares": 302, "saves": 1159, "watch_time": 72000, "reach": 64399, "published_date": "2026-08-10"},
    {"id": 46, "creator_id": 1, "platform": "Instagram", "external_content_id": "ig_011", "content_title": "Aesthetic Code Editor Themes 2026 Edition", "views": 80500, "likes": 5635, "comments": 450, "shares": 563, "saves": 1014, "watch_time": 103499, "reach": 92575, "published_date": "2026-08-11"},
    {"id": 47, "creator_id": 1, "platform": "Instagram", "external_content_id": "ig_012", "content_title": "Mobile App UI Design Kit & Micro-Interactions", "views": 38500, "likes": 3850, "comments": 385, "shares": 308, "saves": 885, "watch_time": 49500, "reach": 44275, "published_date": "2026-08-12"},
    {"id": 48, "creator_id": 1, "platform": "Instagram", "external_content_id": "ig_013", "content_title": "10 Commandments of Software Architecture", "views": 63000, "likes": 5040, "comments": 403, "shares": 302, "saves": 907, "watch_time": 81000, "reach": 72450, "published_date": "2026-08-13"},
    {"id": 49, "creator_id": 1, "platform": "Instagram", "external_content_id": "ig_014", "content_title": "Remote Work Workspace Evolution", "views": 87500, "likes": 9625, "comments": 962, "shares": 962, "saves": 2213, "watch_time": 112500, "reach": 100624, "published_date": "2026-08-14"},
    {"id": 50, "creator_id": 1, "platform": "Instagram", "external_content_id": "ig_015", "content_title": "Async/Await vs Promises Breakdown Reel", "views": 45500, "likes": 4095, "comments": 327, "shares": 327, "saves": 737, "watch_time": 58500, "reach": 52324, "published_date": "2026-08-15"},
    {"id": 51, "creator_id": 1, "platform": "Instagram", "external_content_id": "ig_016", "content_title": "Frontend Performance Optimization Tips", "views": 70000, "likes": 4900, "comments": 490, "shares": 294, "saves": 1127, "watch_time": 90000, "reach": 80500, "published_date": "2026-08-16"},
    {"id": 52, "creator_id": 1, "platform": "Instagram", "external_content_id": "ig_017", "content_title": "Developer Burnout Prevention Guide", "views": 94500, "likes": 9450, "comments": 756, "shares": 945, "saves": 1701, "watch_time": 121500, "reach": 108674, "published_date": "2026-08-17"},
    {"id": 53, "creator_id": 1, "platform": "Instagram", "external_content_id": "ig_018", "content_title": "State Management in React 19 Explained", "views": 52500, "likes": 4200, "comments": 420, "shares": 336, "saves": 965, "watch_time": 67500, "reach": 60374, "published_date": "2026-08-18"},
    {"id": 54, "creator_id": 1, "platform": "Instagram", "external_content_id": "ig_019", "content_title": "5 UI Animation Secrets for Smooth Web Apps", "views": 77000, "likes": 8470, "comments": 677, "shares": 508, "saves": 1524, "watch_time": 99000, "reach": 88550, "published_date": "2026-08-19"},
    {"id": 55, "creator_id": 1, "platform": "Instagram", "external_content_id": "ig_020", "content_title": "Design System Foundations: Tokens, Colors & Spacing", "views": 35000, "likes": 3150, "comments": 315, "shares": 315, "saves": 724, "watch_time": 45000, "reach": 40250, "published_date": "2026-08-20"},
    {"id": 56, "creator_id": 1, "platform": "Instagram", "external_content_id": "ig_021", "content_title": "Behind the Scenes of Product Launch Week \ud83d\ude80", "views": 59500, "likes": 4165, "comments": 333, "shares": 333, "saves": 749, "watch_time": 76500, "reach": 68425, "published_date": "2026-08-21"},
    {"id": 57, "creator_id": 1, "platform": "Instagram", "external_content_id": "ig_022", "content_title": "Why Modular Code Architecture Keeps You Sane", "views": 84000, "likes": 8400, "comments": 840, "shares": 504, "saves": 1931, "watch_time": 108000, "reach": 96599, "published_date": "2026-08-22"},
    {"id": 58, "creator_id": 1, "platform": "Instagram", "external_content_id": "ig_023", "content_title": "Mobile Responsive Design Patterns That Work", "views": 42000, "likes": 3360, "comments": 268, "shares": 336, "saves": 604, "watch_time": 54000, "reach": 48299, "published_date": "2026-08-23"},
    {"id": 59, "creator_id": 1, "platform": "Instagram", "external_content_id": "ig_024", "content_title": "Figma to Code Workflow in 2026", "views": 66500, "likes": 7315, "comments": 731, "shares": 585, "saves": 1682, "watch_time": 85500, "reach": 76475, "published_date": "2026-08-24"},
    {"id": 60, "creator_id": 1, "platform": "Instagram", "external_content_id": "ig_025", "content_title": "Tech Lead Desk Tour & Must-Have Gadgets", "views": 91000, "likes": 8190, "comments": 655, "shares": 491, "saves": 1474, "watch_time": 117000, "reach": 104649, "published_date": "2026-08-25"},
    {"id": 61, "creator_id": 1, "platform": "Instagram", "external_content_id": "ig_026", "content_title": "Keyboard Shortcuts Every Dev Must Memorize", "views": 49000, "likes": 3430, "comments": 343, "shares": 343, "saves": 788, "watch_time": 62999, "reach": 56349, "published_date": "2026-09-02"},
    {"id": 62, "creator_id": 1, "platform": "Instagram", "external_content_id": "ig_027", "content_title": "How to Structure Large Scale React Repos", "views": 73500, "likes": 7350, "comments": 588, "shares": 588, "saves": 1323, "watch_time": 94500, "reach": 84525, "published_date": "2026-09-03"},
    {"id": 63, "creator_id": 1, "platform": "Instagram", "external_content_id": "ig_028", "content_title": "Custom Hook Design Patterns in React", "views": 98000, "likes": 7840, "comments": 784, "shares": 470, "saves": 1803, "watch_time": 125999, "reach": 112699, "published_date": "2026-09-04"},
    {"id": 64, "creator_id": 1, "platform": "Instagram", "external_content_id": "ig_029", "content_title": "API Response Error Handling Best Practices", "views": 56000, "likes": 6160, "comments": 492, "shares": 616, "saves": 1108, "watch_time": 72000, "reach": 64399, "published_date": "2026-09-05"},
    {"id": 65, "creator_id": 1, "platform": "Instagram", "external_content_id": "ig_030", "content_title": "Creating Glassmorphic Card Components", "views": 80500, "likes": 7245, "comments": 724, "shares": 579, "saves": 1666, "watch_time": 103499, "reach": 92575, "published_date": "2026-09-01"},
    {"id": 66, "creator_id": 1, "platform": "Instagram", "external_content_id": "ig_031", "content_title": "Typography Scale Guide for Web Developers", "views": 38500, "likes": 2695, "comments": 215, "shares": 161, "saves": 485, "watch_time": 49500, "reach": 44275, "published_date": "2026-09-02"},
    {"id": 67, "creator_id": 1, "platform": "Instagram", "external_content_id": "ig_032", "content_title": "Debugging Mobile Web Apps on Real Devices", "views": 63000, "likes": 6300, "comments": 630, "shares": 630, "saves": 1449, "watch_time": 81000, "reach": 72450, "published_date": "2026-09-03"},
    {"id": 68, "creator_id": 1, "platform": "Instagram", "external_content_id": "ig_033", "content_title": "Essential Linux Terminal Hacks Carousel", "views": 87500, "likes": 7000, "comments": 560, "shares": 560, "saves": 1260, "watch_time": 112500, "reach": 100624, "published_date": "2026-09-04"},
    {"id": 69, "creator_id": 1, "platform": "Instagram", "external_content_id": "ig_034", "content_title": "My Developer Book Recommendations 2026", "views": 45500, "likes": 5005, "comments": 500, "shares": 300, "saves": 1151, "watch_time": 58500, "reach": 52324, "published_date": "2026-09-05"},
    {"id": 70, "creator_id": 1, "platform": "Instagram", "external_content_id": "ig_035", "content_title": "How I Plan My Weekly Coding Sprints", "views": 70000, "likes": 6300, "comments": 504, "shares": 630, "saves": 1134, "watch_time": 90000, "reach": 80500, "published_date": "2026-09-01"},
    {"id": 71, "creator_id": 1, "platform": "TikTok", "external_content_id": "tk_001", "content_title": "Fast vs Slow Coding Habits POV", "views": 60000, "likes": 4200, "comments": 336, "shares": 252, "saves": 756, "watch_time": 80000, "reach": 69000, "published_date": "2026-08-01"},
    {"id": 72, "creator_id": 1, "platform": "TikTok", "external_content_id": "tk_002", "content_title": "When the Code Works on First Try \ud83d\ude02", "views": 102000, "likes": 10200, "comments": 1020, "shares": 1020, "saves": 2346, "watch_time": 136000, "reach": 117299, "published_date": "2026-08-02"},
    {"id": 73, "creator_id": 1, "platform": "TikTok", "external_content_id": "tk_003", "content_title": "Junior vs Senior Dev Debugging Approach", "views": 144000, "likes": 11520, "comments": 921, "shares": 921, "saves": 2073, "watch_time": 192000, "reach": 165600, "published_date": "2026-08-03"},
    {"id": 74, "creator_id": 1, "platform": "TikTok", "external_content_id": "tk_004", "content_title": "3 AI Tools Every Programmer Must Use", "views": 72000, "likes": 7920, "comments": 792, "shares": 475, "saves": 1821, "watch_time": 96000, "reach": 82800, "published_date": "2026-08-04"},
    {"id": 75, "creator_id": 1, "platform": "TikTok", "external_content_id": "tk_005", "content_title": "Why Nobody Talks About Memory Leaks", "views": 114000, "likes": 10260, "comments": 820, "shares": 1026, "saves": 1846, "watch_time": 152000, "reach": 131100, "published_date": "2026-08-05"},
    {"id": 76, "creator_id": 1, "platform": "TikTok", "external_content_id": "tk_006", "content_title": "CSS Flexbox in 15 Seconds Flat", "views": 156000, "likes": 10920, "comments": 1092, "shares": 873, "saves": 2511, "watch_time": 208000, "reach": 179400, "published_date": "2026-08-06"},
    {"id": 77, "creator_id": 1, "platform": "TikTok", "external_content_id": "tk_007", "content_title": "Things Clients Say That Keep Me Up at Night", "views": 84000, "likes": 8400, "comments": 672, "shares": 504, "saves": 1512, "watch_time": 112000, "reach": 96599, "published_date": "2026-08-07"},
    {"id": 78, "creator_id": 1, "platform": "TikTok", "external_content_id": "tk_008", "content_title": "How APIs Actually Talk to Databases (Visualized)", "views": 126000, "likes": 10080, "comments": 1008, "shares": 1008, "saves": 2318, "watch_time": 168000, "reach": 144900, "published_date": "2026-08-08"},
    {"id": 79, "creator_id": 1, "platform": "TikTok", "external_content_id": "tk_009", "content_title": "The Dark Secret of Git Merge vs Rebase", "views": 168000, "likes": 18480, "comments": 1478, "shares": 1478, "saves": 3326, "watch_time": 224000, "reach": 193199, "published_date": "2026-08-09"},
    {"id": 80, "creator_id": 1, "platform": "TikTok", "external_content_id": "tk_010", "content_title": "How Hackers Steal JWT Tokens in 30 Sec", "views": 96000, "likes": 8640, "comments": 864, "shares": 518, "saves": 1987, "watch_time": 128000, "reach": 110399, "published_date": "2026-08-10"},
    {"id": 81, "creator_id": 1, "platform": "TikTok", "external_content_id": "tk_011", "content_title": "5 Terminal Shortcuts You Will Love", "views": 138000, "likes": 9660, "comments": 772, "shares": 966, "saves": 1738, "watch_time": 184000, "reach": 158700, "published_date": "2026-08-11"},
    {"id": 82, "creator_id": 1, "platform": "TikTok", "external_content_id": "tk_012", "content_title": "Coding at 3 AM vs 9 AM POV", "views": 66000, "likes": 6600, "comments": 660, "shares": 528, "saves": 1517, "watch_time": 88000, "reach": 75900, "published_date": "2026-08-12"},
    {"id": 83, "creator_id": 1, "platform": "TikTok", "external_content_id": "tk_013", "content_title": "React Server Components in 30 Seconds", "views": 108000, "likes": 8640, "comments": 691, "shares": 518, "saves": 1555, "watch_time": 144000, "reach": 124199, "published_date": "2026-08-13"},
    {"id": 84, "creator_id": 1, "platform": "TikTok", "external_content_id": "tk_014", "content_title": "Software Engineer Salary Expectations 2026", "views": 150000, "likes": 16500, "comments": 1650, "shares": 1650, "saves": 3794, "watch_time": 200000, "reach": 172500, "published_date": "2026-08-14"},
    {"id": 85, "creator_id": 1, "platform": "TikTok", "external_content_id": "tk_015", "content_title": "Why C++ Is Still the Undisputed King", "views": 78000, "likes": 7020, "comments": 561, "shares": 561, "saves": 1263, "watch_time": 104000, "reach": 89700, "published_date": "2026-08-15"},
    {"id": 86, "creator_id": 1, "platform": "TikTok", "external_content_id": "tk_016", "content_title": "How DNS Resolves Domain Names Instantly", "views": 120000, "likes": 8400, "comments": 840, "shares": 504, "saves": 1931, "watch_time": 160000, "reach": 138000, "published_date": "2026-08-16"},
    {"id": 87, "creator_id": 1, "platform": "TikTok", "external_content_id": "tk_017", "content_title": "The Bug That Cost Knight Capital $440M", "views": 162000, "likes": 16200, "comments": 1296, "shares": 1620, "saves": 2916, "watch_time": 216000, "reach": 186300, "published_date": "2026-08-17"},
    {"id": 88, "creator_id": 1, "platform": "TikTok", "external_content_id": "tk_018", "content_title": "Linux vs Windows for Web Development", "views": 90000, "likes": 7200, "comments": 720, "shares": 576, "saves": 1655, "watch_time": 120000, "reach": 103499, "published_date": "2026-08-18"},
    {"id": 89, "creator_id": 1, "platform": "TikTok", "external_content_id": "tk_019", "content_title": "POV: Writing Regex Without StackOverflow \ud83e\udde0", "views": 132000, "likes": 14520, "comments": 1161, "shares": 871, "saves": 2613, "watch_time": 176000, "reach": 151800, "published_date": "2026-08-19"},
    {"id": 90, "creator_id": 1, "platform": "TikTok", "external_content_id": "tk_020", "content_title": "When You Forget the WHERE Clause in UPDATE Query", "views": 60000, "likes": 5400, "comments": 540, "shares": 540, "saves": 1242, "watch_time": 80000, "reach": 69000, "published_date": "2026-08-20"},
    {"id": 91, "creator_id": 1, "platform": "TikTok", "external_content_id": "tk_021", "content_title": "Why NullPointerExceptions are My Nemesis", "views": 102000, "likes": 7140, "comments": 571, "shares": 571, "saves": 1285, "watch_time": 136000, "reach": 117299, "published_date": "2026-08-21"},
    {"id": 92, "creator_id": 1, "platform": "TikTok", "external_content_id": "tk_022", "content_title": "3 CSS One-Liners That Replace 50 Lines of Code", "views": 144000, "likes": 14400, "comments": 1440, "shares": 864, "saves": 3311, "watch_time": 192000, "reach": 165600, "published_date": "2026-08-22"},
    {"id": 93, "creator_id": 1, "platform": "TikTok", "external_content_id": "tk_023", "content_title": "How WebAssembly Runs C Code in the Browser", "views": 72000, "likes": 5760, "comments": 460, "shares": 576, "saves": 1036, "watch_time": 96000, "reach": 82800, "published_date": "2026-08-23"},
    {"id": 94, "creator_id": 1, "platform": "TikTok", "external_content_id": "tk_024", "content_title": "The Secret Power of Chrome DevTools Sources Tab", "views": 114000, "likes": 12540, "comments": 1254, "shares": 1003, "saves": 2884, "watch_time": 152000, "reach": 131100, "published_date": "2026-08-24"},
    {"id": 95, "creator_id": 1, "platform": "TikTok", "external_content_id": "tk_025", "content_title": "POV: Deploying to Production on a Friday \ud83d\udc80", "views": 156000, "likes": 14040, "comments": 1123, "shares": 842, "saves": 2527, "watch_time": 208000, "reach": 179400, "published_date": "2026-08-25"},
    {"id": 96, "creator_id": 1, "platform": "TikTok", "external_content_id": "tk_026", "content_title": "How OAuth Login Actually Works Behind the Scenes", "views": 84000, "likes": 5880, "comments": 588, "shares": 588, "saves": 1352, "watch_time": 112000, "reach": 96599, "published_date": "2026-09-02"},
    {"id": 97, "creator_id": 1, "platform": "TikTok", "external_content_id": "tk_027", "content_title": "When the Tech Lead Reviews Your Pull Request", "views": 126000, "likes": 12600, "comments": 1008, "shares": 1008, "saves": 2268, "watch_time": 168000, "reach": 144900, "published_date": "2026-09-03"},
    {"id": 98, "creator_id": 1, "platform": "TikTok", "external_content_id": "tk_028", "content_title": "5 Hidden Python Shortcuts You Didn't Know", "views": 168000, "likes": 13440, "comments": 1344, "shares": 806, "saves": 3091, "watch_time": 224000, "reach": 193199, "published_date": "2026-09-04"},
    {"id": 99, "creator_id": 1, "platform": "TikTok", "external_content_id": "tk_029", "content_title": "Why Node.js Event Loop is Fast", "views": 96000, "likes": 10560, "comments": 844, "shares": 1056, "saves": 1900, "watch_time": 128000, "reach": 110399, "published_date": "2026-09-05"},
    {"id": 100, "creator_id": 1, "platform": "TikTok", "external_content_id": "tk_030", "content_title": "CSS Grid Centering Hack in 5 Seconds", "views": 138000, "likes": 12420, "comments": 1242, "shares": 993, "saves": 2856, "watch_time": 184000, "reach": 158700, "published_date": "2026-09-01"},
    {"id": 101, "creator_id": 1, "platform": "TikTok", "external_content_id": "tk_031", "content_title": "How Cryptographic Hashing Keeps Passwords Safe", "views": 66000, "likes": 4620, "comments": 369, "shares": 277, "saves": 831, "watch_time": 88000, "reach": 75900, "published_date": "2026-09-02"},
    {"id": 102, "creator_id": 1, "platform": "TikTok", "external_content_id": "tk_032", "content_title": "When You Copy Code from ChatGPT & It Works", "views": 108000, "likes": 10800, "comments": 1080, "shares": 1080, "saves": 2484, "watch_time": 144000, "reach": 124199, "published_date": "2026-09-03"},
    {"id": 103, "creator_id": 1, "platform": "TikTok", "external_content_id": "tk_033", "content_title": "The Difference Between Docker Image and Container", "views": 150000, "likes": 12000, "comments": 960, "shares": 960, "saves": 2160, "watch_time": 200000, "reach": 172500, "published_date": "2026-09-04"},
    {"id": 104, "creator_id": 1, "platform": "TikTok", "external_content_id": "tk_034", "content_title": "Why SQL Joins Confuse Everyone at First", "views": 78000, "likes": 8580, "comments": 858, "shares": 514, "saves": 1973, "watch_time": 104000, "reach": 89700, "published_date": "2026-09-05"},
    {"id": 105, "creator_id": 1, "platform": "TikTok", "external_content_id": "tk_035", "content_title": "Coding Soundtrack: Lo-Fi Beats & Dark Mode UI", "views": 120000, "likes": 10800, "comments": 864, "shares": 1080, "saves": 1944, "watch_time": 160000, "reach": 138000, "published_date": "2026-09-01"},
    {"id": 106, "creator_id": 1, "platform": "LinkedIn", "external_content_id": "li_001", "content_title": "How I Scaled My Channel to 250K Subscribers", "views": 15000, "likes": 1050, "comments": 84, "shares": 63, "saves": 189, "watch_time": 25000, "reach": 17250, "published_date": "2026-08-01"},
    {"id": 107, "creator_id": 1, "platform": "LinkedIn", "external_content_id": "li_002", "content_title": "The Shift from Monolith to Event-Driven Architecture", "views": 25500, "likes": 2550, "comments": 255, "shares": 255, "saves": 586, "watch_time": 42500, "reach": 29324, "published_date": "2026-08-02"},
    {"id": 108, "creator_id": 1, "platform": "LinkedIn", "external_content_id": "li_003", "content_title": "Why Technical Documentation Is Your Greatest Asset", "views": 36000, "likes": 2880, "comments": 230, "shares": 230, "saves": 518, "watch_time": 60000, "reach": 41400, "published_date": "2026-08-03"},
    {"id": 109, "creator_id": 1, "platform": "LinkedIn", "external_content_id": "li_004", "content_title": "Lessons Learned Hiring 50+ Engineers for Startups", "views": 18000, "likes": 1980, "comments": 198, "shares": 118, "saves": 455, "watch_time": 30000, "reach": 20700, "published_date": "2026-08-04"},
    {"id": 110, "creator_id": 1, "platform": "LinkedIn", "external_content_id": "li_005", "content_title": "Why Senior Developers Write Less Code Than Juniors", "views": 28500, "likes": 2565, "comments": 205, "shares": 256, "saves": 461, "watch_time": 47500, "reach": 32775, "published_date": "2026-08-05"},
    {"id": 111, "creator_id": 1, "platform": "LinkedIn", "external_content_id": "li_006", "content_title": "Engineering Leadership: Tech Debt vs Velocity", "views": 39000, "likes": 2730, "comments": 273, "shares": 218, "saves": 627, "watch_time": 65000, "reach": 44850, "published_date": "2026-08-06"},
    {"id": 112, "creator_id": 1, "platform": "LinkedIn", "external_content_id": "li_007", "content_title": "How We Cut Cloud Infrastructure Costs by 42%", "views": 21000, "likes": 2100, "comments": 168, "shares": 126, "saves": 378, "watch_time": 35000, "reach": 24149, "published_date": "2026-08-07"},
    {"id": 113, "creator_id": 1, "platform": "LinkedIn", "external_content_id": "li_008", "content_title": "Framework Fatigue: Foundational CS Always Wins", "views": 31500, "likes": 2520, "comments": 252, "shares": 252, "saves": 579, "watch_time": 52500, "reach": 36225, "published_date": "2026-08-08"},
    {"id": 114, "creator_id": 1, "platform": "LinkedIn", "external_content_id": "li_009", "content_title": "Navigating Technical Career Progression: IC vs Management", "views": 42000, "likes": 4620, "comments": 369, "shares": 369, "saves": 831, "watch_time": 70000, "reach": 48299, "published_date": "2026-08-09"},
    {"id": 115, "creator_id": 1, "platform": "LinkedIn", "external_content_id": "li_010", "content_title": "The ROI of Comprehensive Automated Integration Testing", "views": 24000, "likes": 2160, "comments": 216, "shares": 129, "saves": 496, "watch_time": 40000, "reach": 27599, "published_date": "2026-08-10"},
    {"id": 116, "creator_id": 1, "platform": "LinkedIn", "external_content_id": "li_011", "content_title": "Building Resilient Multi-Cloud Microservice Frameworks", "views": 34500, "likes": 2415, "comments": 193, "shares": 241, "saves": 434, "watch_time": 57499, "reach": 39675, "published_date": "2026-08-11"},
    {"id": 117, "creator_id": 1, "platform": "LinkedIn", "external_content_id": "li_012", "content_title": "Effective Code Review Culture in Distributed Tech Teams", "views": 16500, "likes": 1650, "comments": 165, "shares": 132, "saves": 379, "watch_time": 27500, "reach": 18975, "published_date": "2026-08-12"},
    {"id": 118, "creator_id": 1, "platform": "LinkedIn", "external_content_id": "li_013", "content_title": "Measuring Engineering Productivity Beyond Lines of Code", "views": 27000, "likes": 2160, "comments": 172, "shares": 129, "saves": 388, "watch_time": 45000, "reach": 31049, "published_date": "2026-08-13"},
    {"id": 119, "creator_id": 1, "platform": "LinkedIn", "external_content_id": "li_014", "content_title": "System Reliability Engineering: SLOs and Error Budgets", "views": 37500, "likes": 4125, "comments": 412, "shares": 412, "saves": 948, "watch_time": 62500, "reach": 43125, "published_date": "2026-08-14"},
    {"id": 120, "creator_id": 1, "platform": "LinkedIn", "external_content_id": "li_015", "content_title": "Zero Trust Security Architecture for Cloud Native Apps", "views": 19500, "likes": 1755, "comments": 140, "shares": 140, "saves": 315, "watch_time": 32500, "reach": 22425, "published_date": "2026-08-15"},
    {"id": 121, "creator_id": 1, "platform": "LinkedIn", "external_content_id": "li_016", "content_title": "Mentoring Junior Developers: A Framework for Tech Leaders", "views": 30000, "likes": 2100, "comments": 210, "shares": 126, "saves": 482, "watch_time": 50000, "reach": 34500, "published_date": "2026-08-16"},
    {"id": 122, "creator_id": 1, "platform": "LinkedIn", "external_content_id": "li_017", "content_title": "High-Performance Database Indexing & Sharding Tactics", "views": 40500, "likes": 4050, "comments": 324, "shares": 405, "saves": 729, "watch_time": 67500, "reach": 46575, "published_date": "2026-08-17"},
    {"id": 123, "creator_id": 1, "platform": "LinkedIn", "external_content_id": "li_018", "content_title": "Generative AI Integration Strategies for Enterprise SaaS", "views": 22500, "likes": 1800, "comments": 180, "shares": 144, "saves": 413, "watch_time": 37500, "reach": 25874, "published_date": "2026-08-18"},
    {"id": 124, "creator_id": 1, "platform": "LinkedIn", "external_content_id": "li_019", "content_title": "How to Conduct System Design Interviews Fairly", "views": 33000, "likes": 3630, "comments": 290, "shares": 217, "saves": 653, "watch_time": 55000, "reach": 37950, "published_date": "2026-08-19"},
    {"id": 125, "creator_id": 1, "platform": "LinkedIn", "external_content_id": "li_020", "content_title": "Building High Trust Async Remote Work Cultures", "views": 15000, "likes": 1350, "comments": 135, "shares": 135, "saves": 310, "watch_time": 25000, "reach": 17250, "published_date": "2026-08-20"},
    {"id": 126, "creator_id": 1, "platform": "LinkedIn", "external_content_id": "li_021", "content_title": "Key Takeaways from Scaling Tech Teams to 100+ Engineers", "views": 25500, "likes": 1785, "comments": 142, "shares": 142, "saves": 321, "watch_time": 42500, "reach": 29324, "published_date": "2026-08-21"},
    {"id": 127, "creator_id": 1, "platform": "LinkedIn", "external_content_id": "li_022", "content_title": "Why Onboarding Experience Matters More Than You Think", "views": 36000, "likes": 3600, "comments": 360, "shares": 216, "saves": 827, "watch_time": 60000, "reach": 41400, "published_date": "2026-08-22"},
    {"id": 128, "creator_id": 1, "platform": "LinkedIn", "external_content_id": "li_023", "content_title": "The Evolution of Full-Stack Engineering 2016-2026", "views": 18000, "likes": 1440, "comments": 115, "shares": 144, "saves": 259, "watch_time": 30000, "reach": 20700, "published_date": "2026-08-23"},
    {"id": 129, "creator_id": 1, "platform": "LinkedIn", "external_content_id": "li_024", "content_title": "Managing Technical Debt in Fast Growing Startups", "views": 28500, "likes": 3135, "comments": 313, "shares": 250, "saves": 721, "watch_time": 47500, "reach": 32775, "published_date": "2026-08-24"},
    {"id": 130, "creator_id": 1, "platform": "LinkedIn", "external_content_id": "li_025", "content_title": "Strategic Decision Making: Buy vs Build in SaaS", "views": 39000, "likes": 3510, "comments": 280, "shares": 210, "saves": 631, "watch_time": 65000, "reach": 44850, "published_date": "2026-08-25"},
    {"id": 131, "creator_id": 1, "platform": "LinkedIn", "external_content_id": "li_026", "content_title": "How Continuous Integration Accelerates Product Delivery", "views": 21000, "likes": 1470, "comments": 147, "shares": 147, "saves": 338, "watch_time": 35000, "reach": 24149, "published_date": "2026-09-02"},
    {"id": 132, "creator_id": 1, "platform": "LinkedIn", "external_content_id": "li_027", "content_title": "The Role of Developer Experience (DevEx) in Retention", "views": 31500, "likes": 3150, "comments": 252, "shares": 252, "saves": 567, "watch_time": 52500, "reach": 36225, "published_date": "2026-09-03"},
    {"id": 133, "creator_id": 1, "platform": "LinkedIn", "external_content_id": "li_028", "content_title": "Cross-Functional Alignment Between Product & Engineering", "views": 42000, "likes": 3360, "comments": 336, "shares": 201, "saves": 772, "watch_time": 70000, "reach": 48299, "published_date": "2026-09-04"},
    {"id": 134, "creator_id": 1, "platform": "LinkedIn", "external_content_id": "li_029", "content_title": "Post-Mortem Root Cause Analysis Culture", "views": 24000, "likes": 2640, "comments": 211, "shares": 264, "saves": 475, "watch_time": 40000, "reach": 27599, "published_date": "2026-09-05"},
    {"id": 135, "creator_id": 1, "platform": "LinkedIn", "external_content_id": "li_030", "content_title": "Designing API Contracts for Long Term Maintainability", "views": 34500, "likes": 3105, "comments": 310, "shares": 248, "saves": 714, "watch_time": 57499, "reach": 39675, "published_date": "2026-09-01"},
    {"id": 136, "creator_id": 1, "platform": "LinkedIn", "external_content_id": "li_031", "content_title": "Lessons from Rearchitecting Legacy Database Systems", "views": 16500, "likes": 1155, "comments": 92, "shares": 69, "saves": 207, "watch_time": 27500, "reach": 18975, "published_date": "2026-09-02"},
    {"id": 137, "creator_id": 1, "platform": "LinkedIn", "external_content_id": "li_032", "content_title": "Why We Adopted Rust for Core Services", "views": 27000, "likes": 2700, "comments": 270, "shares": 270, "saves": 621, "watch_time": 45000, "reach": 31049, "published_date": "2026-09-03"},
    {"id": 138, "creator_id": 1, "platform": "LinkedIn", "external_content_id": "li_033", "content_title": "Fostering Innovation in Distributed Tech Organizations", "views": 37500, "likes": 3000, "comments": 240, "shares": 240, "saves": 540, "watch_time": 62500, "reach": 43125, "published_date": "2026-09-04"},
    {"id": 139, "creator_id": 1, "platform": "LinkedIn", "external_content_id": "li_034", "content_title": "Career Advice I Wish I Knew as a Junior Developer", "views": 19500, "likes": 2145, "comments": 214, "shares": 128, "saves": 493, "watch_time": 32500, "reach": 22425, "published_date": "2026-09-05"},
    {"id": 140, "creator_id": 1, "platform": "LinkedIn", "external_content_id": "li_035", "content_title": "The Impact of AI Code Assistants on Team Velocity", "views": 30000, "likes": 2700, "comments": 216, "shares": 270, "saves": 486, "watch_time": 50000, "reach": 34500, "published_date": "2026-09-01"},
    {"id": 141, "creator_id": 1, "platform": "X", "external_content_id": "x_001", "content_title": "Thread: Web Development Trends in 2026 & Beyond \ud83e\uddf5", "views": 14000, "likes": 980, "comments": 78, "shares": 58, "saves": 176, "watch_time": 20000, "reach": 16099, "published_date": "2026-08-01"},
    {"id": 142, "creator_id": 1, "platform": "X", "external_content_id": "x_002", "content_title": "Stop using useEffect for data fetching in React 19.", "views": 23800, "likes": 2380, "comments": 238, "shares": 238, "saves": 547, "watch_time": 34000, "reach": 27369, "published_date": "2026-08-02"},
    {"id": 143, "creator_id": 1, "platform": "X", "external_content_id": "x_003", "content_title": "TypeScript 5.8 features you will actually use every day", "views": 33600, "likes": 2688, "comments": 215, "shares": 215, "saves": 483, "watch_time": 48000, "reach": 38640, "published_date": "2026-08-03"},
    {"id": 144, "creator_id": 1, "platform": "X", "external_content_id": "x_004", "content_title": "Hot take: 90% of apps do not need microservices.", "views": 16800, "likes": 1848, "comments": 184, "shares": 110, "saves": 425, "watch_time": 24000, "reach": 19320, "published_date": "2026-08-04"},
    {"id": 145, "creator_id": 1, "platform": "X", "external_content_id": "x_005", "content_title": "The cleanest SQL query pattern for hierarchical data", "views": 26600, "likes": 2394, "comments": 191, "shares": 239, "saves": 430, "watch_time": 38000, "reach": 30589, "published_date": "2026-08-05"},
    {"id": 146, "creator_id": 1, "platform": "X", "external_content_id": "x_006", "content_title": "Thread: 10 Linux CLI commands that feel like superpowers \ud83d\udc27", "views": 36400, "likes": 2548, "comments": 254, "shares": 203, "saves": 586, "watch_time": 52000, "reach": 41860, "published_date": "2026-08-06"},
    {"id": 147, "creator_id": 1, "platform": "X", "external_content_id": "x_007", "content_title": "Build a custom HTTP server from scratch in Node", "views": 19600, "likes": 1960, "comments": 156, "shares": 117, "saves": 352, "watch_time": 28000, "reach": 22540, "published_date": "2026-08-07"},
    {"id": 148, "creator_id": 1, "platform": "X", "external_content_id": "x_008", "content_title": "Why Zustand is beating Redux Toolkit for React state management", "views": 29400, "likes": 2352, "comments": 235, "shares": 235, "saves": 540, "watch_time": 42000, "reach": 33810, "published_date": "2026-08-08"},
    {"id": 149, "creator_id": 1, "platform": "X", "external_content_id": "x_009", "content_title": "Quick tip: Use CSS grid-template-areas for responsive cards", "views": 39200, "likes": 4312, "comments": 344, "shares": 344, "saves": 776, "watch_time": 56000, "reach": 45080, "published_date": "2026-08-09"},
    {"id": 150, "creator_id": 1, "platform": "X", "external_content_id": "x_010", "content_title": "Rust vs Go for high-concurrency microservices: my findings", "views": 22400, "likes": 2016, "comments": 201, "shares": 120, "saves": 463, "watch_time": 32000, "reach": 25759, "published_date": "2026-08-10"},
    {"id": 151, "creator_id": 1, "platform": "X", "external_content_id": "x_011", "content_title": "Docker multi-stage builds reduce image size by 80%", "views": 32199, "likes": 2253, "comments": 180, "shares": 225, "saves": 405, "watch_time": 46000, "reach": 37028, "published_date": "2026-08-11"},
    {"id": 152, "creator_id": 1, "platform": "X", "external_content_id": "x_012", "content_title": "The 3 VS Code keyboard shortcuts I use 100x a day", "views": 15400, "likes": 1540, "comments": 154, "shares": 123, "saves": 354, "watch_time": 22000, "reach": 17710, "published_date": "2026-08-12"},
    {"id": 153, "creator_id": 1, "platform": "X", "external_content_id": "x_013", "content_title": "Thread: How database B-Trees work under the hood \ud83c\udf32", "views": 25200, "likes": 2016, "comments": 161, "shares": 120, "saves": 362, "watch_time": 36000, "reach": 28979, "published_date": "2026-08-13"},
    {"id": 154, "creator_id": 1, "platform": "X", "external_content_id": "x_014", "content_title": "Tailwind v4 CSS variables make theme switching instantaneous", "views": 35000, "likes": 3850, "comments": 385, "shares": 385, "saves": 885, "watch_time": 50000, "reach": 40250, "published_date": "2026-08-14"},
    {"id": 155, "creator_id": 1, "platform": "X", "external_content_id": "x_015", "content_title": "Stop using try/catch blocks as control flow in Node.js", "views": 18200, "likes": 1638, "comments": 131, "shares": 131, "saves": 294, "watch_time": 26000, "reach": 20930, "published_date": "2026-08-15"},
    {"id": 156, "creator_id": 1, "platform": "X", "external_content_id": "x_016", "content_title": "Why WebSockets are better than polling for live analytics", "views": 28000, "likes": 1960, "comments": 196, "shares": 117, "saves": 450, "watch_time": 40000, "reach": 32199, "published_date": "2026-08-16"},
    {"id": 157, "creator_id": 1, "platform": "X", "external_content_id": "x_017", "content_title": "Python 3.14 free-threaded JIT benchmarks are insane", "views": 37800, "likes": 3780, "comments": 302, "shares": 378, "saves": 680, "watch_time": 54000, "reach": 43470, "published_date": "2026-08-17"},
    {"id": 158, "creator_id": 1, "platform": "X", "external_content_id": "x_018", "content_title": "5 open-source LLM tools for local dev productivity", "views": 21000, "likes": 1680, "comments": 168, "shares": 134, "saves": 386, "watch_time": 30000, "reach": 24149, "published_date": "2026-08-18"},
    {"id": 159, "creator_id": 1, "platform": "X", "external_content_id": "x_019", "content_title": "Thread: How Garbage Collection works in V8 Engine \ud83e\uddf5", "views": 30800, "likes": 3388, "comments": 271, "shares": 203, "saves": 609, "watch_time": 44000, "reach": 35420, "published_date": "2026-08-19"},
    {"id": 160, "creator_id": 1, "platform": "X", "external_content_id": "x_020", "content_title": "The power of HTTP/3 and QUIC protocol explained", "views": 14000, "likes": 1260, "comments": 126, "shares": 126, "saves": 289, "watch_time": 20000, "reach": 16099, "published_date": "2026-08-20"},
    {"id": 161, "creator_id": 1, "platform": "X", "external_content_id": "x_021", "content_title": "Stop abusing any in TypeScript. Use unknown instead.", "views": 23800, "likes": 1666, "comments": 133, "shares": 133, "saves": 299, "watch_time": 34000, "reach": 27369, "published_date": "2026-08-21"},
    {"id": 162, "creator_id": 1, "platform": "X", "external_content_id": "x_022", "content_title": "CSS subgrid is now supported everywhere. Use it!", "views": 33600, "likes": 3360, "comments": 336, "shares": 201, "saves": 772, "watch_time": 48000, "reach": 38640, "published_date": "2026-08-22"},
    {"id": 163, "creator_id": 1, "platform": "X", "external_content_id": "x_023", "content_title": "Why server-side rendering is back in full force", "views": 16800, "likes": 1344, "comments": 107, "shares": 134, "saves": 241, "watch_time": 24000, "reach": 19320, "published_date": "2026-08-23"},
    {"id": 164, "creator_id": 1, "platform": "X", "external_content_id": "x_024", "content_title": "Thread: Essential Security Rules for REST APIs \ud83d\udee1\ufe0f", "views": 26600, "likes": 2926, "comments": 292, "shares": 234, "saves": 672, "watch_time": 38000, "reach": 30589, "published_date": "2026-08-24"},
    {"id": 165, "creator_id": 1, "platform": "X", "external_content_id": "x_025", "content_title": "The cleanest folder structure for Next.js 15 apps", "views": 36400, "likes": 3276, "comments": 262, "shares": 196, "saves": 589, "watch_time": 52000, "reach": 41860, "published_date": "2026-08-25"},
    {"id": 166, "creator_id": 1, "platform": "X", "external_content_id": "x_026", "content_title": "Why IndexedDB is crucial for offline-first web apps", "views": 19600, "likes": 1372, "comments": 137, "shares": 137, "saves": 315, "watch_time": 28000, "reach": 22540, "published_date": "2026-09-02"},
    {"id": 167, "creator_id": 1, "platform": "X", "external_content_id": "x_027", "content_title": "Thread: 7 SQL Performance Tuning Hacks \u26a1", "views": 29400, "likes": 2940, "comments": 235, "shares": 235, "saves": 529, "watch_time": 42000, "reach": 33810, "published_date": "2026-09-03"},
    {"id": 168, "creator_id": 1, "platform": "X", "external_content_id": "x_028", "content_title": "Zod schema validation saves hundreds of bug reports", "views": 39200, "likes": 3136, "comments": 313, "shares": 188, "saves": 721, "watch_time": 56000, "reach": 45080, "published_date": "2026-09-04"},
    {"id": 169, "creator_id": 1, "platform": "X", "external_content_id": "x_029", "content_title": "How Browser Rendering Pipeline works under the hood", "views": 22400, "likes": 2464, "comments": 197, "shares": 246, "saves": 443, "watch_time": 32000, "reach": 25759, "published_date": "2026-09-05"},
    {"id": 170, "creator_id": 1, "platform": "X", "external_content_id": "x_030", "content_title": "Why pnpm is 3x faster than npm and yarn", "views": 32199, "likes": 2897, "comments": 289, "shares": 231, "saves": 666, "watch_time": 46000, "reach": 37028, "published_date": "2026-09-01"},
    {"id": 171, "creator_id": 1, "platform": "X", "external_content_id": "x_031", "content_title": "Thread: Top 5 Chrome DevTools Features You Missed \ud83e\uddf5", "views": 15400, "likes": 1078, "comments": 86, "shares": 64, "saves": 194, "watch_time": 22000, "reach": 17710, "published_date": "2026-09-02"},
    {"id": 172, "creator_id": 1, "platform": "X", "external_content_id": "x_032", "content_title": "Mastering Git Rebase with Interactive Mode", "views": 25200, "likes": 2520, "comments": 252, "shares": 252, "saves": 579, "watch_time": 36000, "reach": 28979, "published_date": "2026-09-03"},
    {"id": 173, "creator_id": 1, "platform": "X", "external_content_id": "x_033", "content_title": "Why Web Vitals impact your SEO rankings heavily", "views": 35000, "likes": 2800, "comments": 224, "shares": 224, "saves": 504, "watch_time": 50000, "reach": 40250, "published_date": "2026-09-04"},
    {"id": 174, "creator_id": 1, "platform": "X", "external_content_id": "x_034", "content_title": "Thread: Building Resilient Microservices with Circuit Breakers", "views": 18200, "likes": 2002, "comments": 200, "shares": 120, "saves": 460, "watch_time": 26000, "reach": 20930, "published_date": "2026-09-05"},
    {"id": 175, "creator_id": 1, "platform": "X", "external_content_id": "x_035", "content_title": "The ultimate cheat sheet for Docker Compose v2", "views": 28000, "likes": 2520, "comments": 201, "shares": 252, "saves": 453, "watch_time": 40000, "reach": 32199, "published_date": "2026-09-01"},
    {"id": 176, "creator_id": 1, "platform": "Facebook", "external_content_id": "fb_001", "content_title": "Community Q&A: Software Engineering Roadmap", "views": 18000, "likes": 1260, "comments": 100, "shares": 75, "saves": 226, "watch_time": 30000, "reach": 20700, "published_date": "2026-08-01"},
    {"id": 177, "creator_id": 1, "platform": "Facebook", "external_content_id": "fb_002", "content_title": "Live Stream: Building a Modern SaaS Application", "views": 30600, "likes": 3060, "comments": 306, "shares": 306, "saves": 703, "watch_time": 51000, "reach": 35190, "published_date": "2026-08-02"},
    {"id": 178, "creator_id": 1, "platform": "Facebook", "external_content_id": "fb_003", "content_title": "Behind the Scenes: My Studio Recording Equipment", "views": 43200, "likes": 3456, "comments": 276, "shares": 276, "saves": 622, "watch_time": 72000, "reach": 49679, "published_date": "2026-08-03"},
    {"id": 179, "creator_id": 1, "platform": "Facebook", "external_content_id": "fb_004", "content_title": "Full Video: Best Practices for API Security", "views": 21600, "likes": 2376, "comments": 237, "shares": 142, "saves": 546, "watch_time": 36000, "reach": 24839, "published_date": "2026-08-04"},
    {"id": 180, "creator_id": 1, "platform": "Facebook", "external_content_id": "fb_005", "content_title": "Announcement: CreatorIQ Developer Meetup in Bengaluru!", "views": 34200, "likes": 3078, "comments": 246, "shares": 307, "saves": 554, "watch_time": 57000, "reach": 39330, "published_date": "2026-08-05"},
    {"id": 181, "creator_id": 1, "platform": "Facebook", "external_content_id": "fb_006", "content_title": "Weekly Tech Recap: AI Innovations & Web Trends", "views": 46800, "likes": 3276, "comments": 327, "shares": 262, "saves": 753, "watch_time": 78000, "reach": 53819, "published_date": "2026-08-06"},
    {"id": 182, "creator_id": 1, "platform": "Facebook", "external_content_id": "fb_007", "content_title": "How to Transition into Full-Stack Web Development", "views": 25200, "likes": 2520, "comments": 201, "shares": 151, "saves": 453, "watch_time": 42000, "reach": 28979, "published_date": "2026-08-07"},
    {"id": 183, "creator_id": 1, "platform": "Facebook", "external_content_id": "fb_008", "content_title": "Cloud Infrastructure Setup for Beginners Live Replay", "views": 37800, "likes": 3024, "comments": 302, "shares": 302, "saves": 695, "watch_time": 63000, "reach": 43470, "published_date": "2026-08-08"},
    {"id": 184, "creator_id": 1, "platform": "Facebook", "external_content_id": "fb_009", "content_title": "Ask Me Anything: Career Advice & Salary Negotiation", "views": 50400, "likes": 5544, "comments": 443, "shares": 443, "saves": 997, "watch_time": 84000, "reach": 57959, "published_date": "2026-08-09"},
    {"id": 185, "creator_id": 1, "platform": "Facebook", "external_content_id": "fb_010", "content_title": "Building Accessible Web Interfaces (WCAG 2.2 Standard)", "views": 28800, "likes": 2592, "comments": 259, "shares": 155, "saves": 596, "watch_time": 48000, "reach": 33120, "published_date": "2026-08-10"},
    {"id": 186, "creator_id": 1, "platform": "Facebook", "external_content_id": "fb_011", "content_title": "Database Design Patterns for E-Commerce Platforms", "views": 41400, "likes": 2898, "comments": 231, "shares": 289, "saves": 521, "watch_time": 69000, "reach": 47609, "published_date": "2026-08-11"},
    {"id": 187, "creator_id": 1, "platform": "Facebook", "external_content_id": "fb_012", "content_title": "Modern Frontend Build Tools: Vite vs Webpack", "views": 19800, "likes": 1980, "comments": 198, "shares": 158, "saves": 455, "watch_time": 33000, "reach": 22770, "published_date": "2026-08-12"},
    {"id": 188, "creator_id": 1, "platform": "Facebook", "external_content_id": "fb_013", "content_title": "Keynote Highlights: Future of AI in Software Engineering", "views": 32400, "likes": 2592, "comments": 207, "shares": 155, "saves": 466, "watch_time": 54000, "reach": 37260, "published_date": "2026-08-13"},
    {"id": 189, "creator_id": 1, "platform": "Facebook", "external_content_id": "fb_014", "content_title": "DevOps Culture & Continuous Delivery Masterclass", "views": 45000, "likes": 4950, "comments": 495, "shares": 495, "saves": 1138, "watch_time": 75000, "reach": 51749, "published_date": "2026-08-14"},
    {"id": 190, "creator_id": 1, "platform": "Facebook", "external_content_id": "fb_015", "content_title": "React 19 Compiler Deep Dive Video", "views": 23400, "likes": 2106, "comments": 168, "shares": 168, "saves": 379, "watch_time": 39000, "reach": 26909, "published_date": "2026-08-15"},
    {"id": 191, "creator_id": 1, "platform": "Facebook", "external_content_id": "fb_016", "content_title": "Open Source Contribution Roadmap for New Developers", "views": 36000, "likes": 2520, "comments": 252, "shares": 151, "saves": 579, "watch_time": 60000, "reach": 41400, "published_date": "2026-08-16"},
    {"id": 192, "creator_id": 1, "platform": "Facebook", "external_content_id": "fb_017", "content_title": "Mobile App Performance Optimization Checklist", "views": 48600, "likes": 4860, "comments": 388, "shares": 486, "saves": 874, "watch_time": 81000, "reach": 55889, "published_date": "2026-08-17"},
    {"id": 193, "creator_id": 1, "platform": "Facebook", "external_content_id": "fb_018", "content_title": "Ultimate Tech Stack Breakdown for 2026 Projects", "views": 27000, "likes": 2160, "comments": 216, "shares": 172, "saves": 496, "watch_time": 45000, "reach": 31049, "published_date": "2026-08-18"},
    {"id": 194, "creator_id": 1, "platform": "Facebook", "external_content_id": "fb_019", "content_title": "Building Scalable Backend Services in Python", "views": 39600, "likes": 4356, "comments": 348, "shares": 261, "saves": 784, "watch_time": 66000, "reach": 45540, "published_date": "2026-08-19"},
    {"id": 195, "creator_id": 1, "platform": "Facebook", "external_content_id": "fb_020", "content_title": "Community Discussion: Best Code Editors of 2026", "views": 18000, "likes": 1620, "comments": 162, "shares": 162, "saves": 372, "watch_time": 30000, "reach": 20700, "published_date": "2026-08-20"},
    {"id": 196, "creator_id": 1, "platform": "Facebook", "external_content_id": "fb_021", "content_title": "Live Workshop Replay: Building Realtime Dashboards", "views": 30600, "likes": 2142, "comments": 171, "shares": 171, "saves": 385, "watch_time": 51000, "reach": 35190, "published_date": "2026-08-21"},
    {"id": 197, "creator_id": 1, "platform": "Facebook", "external_content_id": "fb_022", "content_title": "Frontend Frameworks Benchmark: React vs Vue vs Svelte", "views": 43200, "likes": 4320, "comments": 432, "shares": 259, "saves": 993, "watch_time": 72000, "reach": 49679, "published_date": "2026-08-22"},
    {"id": 198, "creator_id": 1, "platform": "Facebook", "external_content_id": "fb_023", "content_title": "How to Prepare for Coding Interviews in 2026", "views": 21600, "likes": 1728, "comments": 138, "shares": 172, "saves": 311, "watch_time": 36000, "reach": 24839, "published_date": "2026-08-23"},
    {"id": 199, "creator_id": 1, "platform": "Facebook", "external_content_id": "fb_024", "content_title": "SaaS Architecture Deep Dive Video", "views": 34200, "likes": 3762, "comments": 376, "shares": 300, "saves": 865, "watch_time": 57000, "reach": 39330, "published_date": "2026-08-24"},
    {"id": 200, "creator_id": 1, "platform": "Facebook", "external_content_id": "fb_025", "content_title": "Software Engineering Career Advice for College Grads", "views": 46800, "likes": 4212, "comments": 336, "shares": 252, "saves": 758, "watch_time": 78000, "reach": 53819, "published_date": "2026-08-25"},
    {"id": 201, "creator_id": 1, "platform": "Facebook", "external_content_id": "fb_026", "content_title": "Building Mobile Apps with React Native & Expo", "views": 25200, "likes": 1764, "comments": 176, "shares": 176, "saves": 405, "watch_time": 42000, "reach": 28979, "published_date": "2026-09-02"},
    {"id": 202, "creator_id": 1, "platform": "Facebook", "external_content_id": "fb_027", "content_title": "GraphQL Query Optimization Strategies", "views": 37800, "likes": 3780, "comments": 302, "shares": 302, "saves": 680, "watch_time": 63000, "reach": 43470, "published_date": "2026-09-03"},
    {"id": 203, "creator_id": 1, "platform": "Facebook", "external_content_id": "fb_028", "content_title": "Container Security & Docker Best Practices", "views": 50400, "likes": 4032, "comments": 403, "shares": 241, "saves": 927, "watch_time": 84000, "reach": 57959, "published_date": "2026-09-04"},
    {"id": 204, "creator_id": 1, "platform": "Facebook", "external_content_id": "fb_029", "content_title": "Understanding Distributed Systems Basics", "views": 28800, "likes": 3168, "comments": 253, "shares": 316, "saves": 570, "watch_time": 48000, "reach": 33120, "published_date": "2026-09-05"},
    {"id": 205, "creator_id": 1, "platform": "Facebook", "external_content_id": "fb_030", "content_title": "Live Q&A: Scaling Tech Communities to 100K Members", "views": 41400, "likes": 3726, "comments": 372, "shares": 298, "saves": 856, "watch_time": 69000, "reach": 47609, "published_date": "2026-09-01"},
    {"id": 206, "creator_id": 1, "platform": "Facebook", "external_content_id": "fb_031", "content_title": "Cloud Native Database Migration Guide", "views": 19800, "likes": 1386, "comments": 110, "shares": 83, "saves": 249, "watch_time": 33000, "reach": 22770, "published_date": "2026-09-02"},
    {"id": 207, "creator_id": 1, "platform": "Facebook", "external_content_id": "fb_032", "content_title": "UI/UX Design Essentials for Developers", "views": 32400, "likes": 3240, "comments": 324, "shares": 324, "saves": 745, "watch_time": 54000, "reach": 37260, "published_date": "2026-09-03"},
    {"id": 208, "creator_id": 1, "platform": "Facebook", "external_content_id": "fb_033", "content_title": "Writing Maintainable Unit Tests in JavaScript", "views": 45000, "likes": 3600, "comments": 288, "shares": 288, "saves": 648, "watch_time": 75000, "reach": 51749, "published_date": "2026-09-04"},
    {"id": 209, "creator_id": 1, "platform": "Facebook", "external_content_id": "fb_034", "content_title": "Mastering Asynchronous Programming in Python", "views": 23400, "likes": 2574, "comments": 257, "shares": 154, "saves": 592, "watch_time": 39000, "reach": 26909, "published_date": "2026-09-05"},
    {"id": 210, "creator_id": 1, "platform": "Facebook", "external_content_id": "fb_035", "content_title": "Full Year Tech Retrospective & Future Outlook", "views": 36000, "likes": 3240, "comments": 259, "shares": 324, "saves": 583, "watch_time": 60000, "reach": 41400, "published_date": "2026-09-01"},
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

def is_valid_platform(platform: Optional[str]) -> bool:
    if not platform or not isinstance(platform, str):
        return False
    return platform.strip().lower() not in ["all", "all platforms", "none", "undefined", "null", ""]


# =======================================================
# 1. default (Users, Search, Auth Login/Register/Me, Home)
# =======================================================

@app.get("/", tags=["default"], summary="Home")
def root_endpoint():
    return {"message": "CreatorIQ Multi-Platform Engine Live", "docs": "/docs"}

@app.get("/users", tags=["default"], summary="Get Users")
def get_users_default():
    return USERS

@app.get("/users/me", tags=["default"], summary="Get Current User Profile")
def get_current_user_profile():
    return USERS[0]

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
def list_content_tag(platform: Optional[str] = None):
    if is_valid_platform(platform):
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
def get_analytics_summary_tag(platform: Optional[str] = None):
    filtered = CONTENTS
    if is_valid_platform(platform):
        filtered = [c for c in CONTENTS if (c.get("platform") or "").lower() == platform.lower()]
    
    filtered_rev = REVENUES
    if is_valid_platform(platform):
        filtered_rev = [r for r in REVENUES if (r.get("platform") or "").lower() == platform.lower() or r.get("platform") == "Multi-Platform"]

    return {
        "total_views": sum(c.get("views", 0) for c in filtered),
        "total_likes": sum(c.get("likes", 0) for c in filtered),
        "total_comments": sum(c.get("comments", 0) for c in filtered),
        "total_shares": sum(c.get("shares", 0) for c in filtered),
        "total_reach": sum(c.get("reach", 0) for c in filtered),
        "total_revenue": sum(r.get("amount", 0) for r in filtered_rev),
    }

@app.get("/analytics/top-content", tags=["analytics"], summary="Top Performing Content")
def get_top_content_tag(limit: int = 5, platform: Optional[str] = None):
    filtered = CONTENTS
    if is_valid_platform(platform):
        filtered = [c for c in CONTENTS if (c.get("platform") or "").lower() == platform.lower()]
    sorted_c = sorted(filtered, key=lambda x: x.get("views", 0), reverse=True)
    return sorted_c[:limit]

@app.get("/analytics/platform-performance", tags=["analytics"], summary="Platform Performance")
def get_platform_performance_tag():
    return compute_platform_comparison(1)

@app.get("/analytics/platform-comparison", tags=["analytics"], summary="Platform Comparison")
def get_platform_comparison_tag():
    return compute_platform_comparison(1)

@app.get("/analytics/chart/engagement", tags=["analytics"], summary="Engagement Chart")
def get_engagement_chart_tag(platform: Optional[str] = None):
    filtered = CONTENTS
    if is_valid_platform(platform):
        filtered = [c for c in CONTENTS if (c.get("platform") or "").lower() == platform.lower()]
    return [
        {"name": c["content_title"][:15], "engagement": round((c["likes"] + c["comments"] + c["shares"]) / (c["reach"] or 1) * 100, 2)}
        for c in filtered[:10]
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
def get_analytics_audience_tag(platform: Optional[str] = None):
    if is_valid_platform(platform):
        return [a for a in AUDIENCES if (a.get("platform") or "").lower() == platform.lower()]
    return AUDIENCES

@app.get("/analytics/growth", tags=["analytics"], summary="Follower Growth Analytics")
def get_analytics_growth_tag():
    return GROWTHS

# =======================================================
# 4. audience
# =======================================================
@app.get("/audience", tags=["audience"], summary="Get Audience Demographics")
def list_audience_tag(platform: Optional[str] = None):
    if is_valid_platform(platform):
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
        {"platform": "X", "connected": True, "handle": "@monikacweets"},
        {"platform": "Facebook", "connected": True, "handle": "Monika Tech Community"}
    ]

@app.get("/social/sync", tags=["social media"], summary="Sync Multi-Platform Data")
@app.post("/social/sync", tags=["social media"], summary="Sync Multi-Platform Data")
@app.get("/social-media/sync", tags=["social media"], summary="Sync Multi-Platform Data")
@app.post("/social-media/sync", tags=["social media"], summary="Sync Multi-Platform Data")
def sync_social_media(payload: Optional[Dict[str, Any]] = Body(None)):
    platform = payload.get("platform") if payload else "All"
    return {"status": "success", "synced_channels": 6, "synced_posts": 46, "platform": platform, "last_synced": datetime.now().isoformat()}

@app.get("/social/youtube/sync", tags=["social media"], summary="Sync Live YouTube Telemetry")
@app.post("/social/youtube/sync", tags=["social media"], summary="Sync Live YouTube Telemetry")
@app.get("/youtube/sync", tags=["social media"], summary="Sync Live YouTube Telemetry")
@app.post("/youtube/sync", tags=["social media"], summary="Sync Live YouTube Telemetry")
def sync_youtube_tag(payload: Optional[Dict[str, Any]] = Body(None)):
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
def list_revenue_tag(platform: Optional[str] = None):
    if is_valid_platform(platform):
        return [r for r in REVENUES if (r.get("platform") or "").lower() == platform.lower() or r.get("platform") == "Multi-Platform"]
    return REVENUES

@app.post("/revenue", tags=["revenue"], summary="Record Revenue Payout")
def create_revenue_tag(item: RevenueCreate):
    new_r = {"id": len(REVENUES) + 1, "creator_id": 1, **item.dict(), "revenue_date": datetime.now().strftime("%Y-%m-%d")}
    REVENUES.append(new_r)
    return new_r

@app.get("/revenue/analytics/summary", tags=["revenue"], summary="Get Revenue Analytics Summary")
def get_revenue_analytics_summary(platform: Optional[str] = None):
    filtered = REVENUES
    if is_valid_platform(platform):
        filtered = [r for r in REVENUES if (r.get("platform") or "").lower() == platform.lower() or r.get("platform") == "Multi-Platform"]
    amounts = [r.get("amount", 0) for r in filtered]
    total = sum(amounts)
    avg = total / len(amounts) if amounts else 0
    max_val = max(amounts) if amounts else 0
    return {
        "total_revenue": total,
        "avg_revenue": avg,
        "max_revenue": max_val,
        "total_count": len(filtered)
    }

@app.get("/revenue/analytics/by-source", tags=["revenue"], summary="Get Revenue by Source")
def get_revenue_analytics_by_source(platform: Optional[str] = None):
    filtered = REVENUES
    if is_valid_platform(platform):
        filtered = [r for r in REVENUES if (r.get("platform") or "").lower() == platform.lower() or r.get("platform") == "Multi-Platform"]
    src_map = {}
    for r in filtered:
        src = r.get("source", "Other")
        src_map[src] = src_map.get(src, 0) + r.get("amount", 0)
    return [{"name": k, "value": v} for k, v in src_map.items()]

@app.get("/revenue/analytics/monthly", tags=["revenue"], summary="Get Monthly Revenue")
def get_revenue_analytics_monthly():
    return [
        {"month": "May", "total": 45000},
        {"month": "Jun", "total": 68000},
        {"month": "Jul", "total": 92000},
        {"month": "Aug", "total": 186500},
        {"month": "Sep", "total": 182000},
    ]

@app.get("/revenue/analytics/trend", tags=["revenue"], summary="Get Revenue Trend")
def get_revenue_analytics_trend():
    return [
        {"date": "2026-08-01", "amount": 45000},
        {"date": "2026-08-12", "amount": 60000},
        {"date": "2026-08-15", "amount": 35000},
        {"date": "2026-08-22", "amount": 28000},
        {"date": "2026-09-01", "amount": 88000},
        {"date": "2026-09-03", "amount": 22000},
    ]

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
def list_sponsorships_tag(platform: Optional[str] = None):
    if is_valid_platform(platform):
        return [s for s in SPONSORSHIPS if (s.get("platform") or "").lower() == platform.lower()]
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
def get_reports_tag(platform: Optional[str] = None):
    filtered_c = CONTENTS
    if is_valid_platform(platform):
        filtered_c = [c for c in CONTENTS if (c.get("platform") or "").lower() == platform.lower()]

    filtered_r = REVENUES
    if is_valid_platform(platform):
        filtered_r = [r for r in REVENUES if (r.get("platform") or "").lower() == platform.lower() or r.get("platform") == "Multi-Platform"]

    filtered_s = SPONSORSHIPS
    if is_valid_platform(platform):
        filtered_s = [s for s in SPONSORSHIPS if (s.get("platform") or "").lower() == platform.lower()]

    return {
        "creator_id": 1,
        "platform_filter": platform or "All",
        "generated_at": datetime.now().isoformat(),
        "total_records": len(filtered_c),
        "content_performance": {
            "total_content": len(filtered_c),
            "total_records": len(filtered_c),
            "total_views": sum(c.get("views", 0) for c in filtered_c),
            "total_likes": sum(c.get("likes", 0) for c in filtered_c),
            "total_comments": sum(c.get("comments", 0) for c in filtered_c),
            "total_shares": sum(c.get("shares", 0) for c in filtered_c),
            "total_reach": sum(c.get("reach", 0) for c in filtered_c),
            "content": filtered_c
        },
        "revenue_analytics": {
            "total_revenue": sum(r.get("amount", 0) for r in filtered_r),
            "total_records": len(filtered_r),
            "data": filtered_r
        },
        "platform_comparison": compute_platform_comparison(1),
        "sponsorships": {
            "total_records": len(filtered_s),
            "data": filtered_s
        }
    }

@app.get("/reports/content", tags=["reports"], summary="Get Content")
def get_content_report_tag(platform: Optional[str] = None):
    filtered = CONTENTS
    if is_valid_platform(platform):
        filtered = [c for c in CONTENTS if (c.get("platform") or "").lower() == platform.lower()]
    return {
        "creator_id": 1,
        "platform_filter": platform or "All",
        "total_records": len(filtered),
        "total_content": len(filtered),
        "total_views": sum(c.get("views", 0) for c in filtered),
        "total_likes": sum(c.get("likes", 0) for c in filtered),
        "total_comments": sum(c.get("comments", 0) for c in filtered),
        "total_shares": sum(c.get("shares", 0) for c in filtered),
        "total_reach": sum(c.get("reach", 0) for c in filtered),
        "data": filtered,
        "content": filtered,
        "items": filtered
    }

@app.get("/reports/audience", tags=["reports"], summary="Get Audience Demographics Report")
def get_audience_report_tag(platform: Optional[str] = None):
    filtered = AUDIENCES
    if is_valid_platform(platform):
        return {
            "creator_id": 1,
            "platform_filter": platform,
            "total_records": len([a for a in AUDIENCES if (a.get("platform") or "").lower() == platform.lower()]),
            "total_followers": sum(a.get("followers", 0) for a in AUDIENCES if (a.get("platform") or "").lower() == platform.lower()),
            "total_reach": sum(a.get("reach", 0) for a in AUDIENCES if (a.get("platform") or "").lower() == platform.lower()),
            "total_impressions": sum(a.get("impressions", 0) for a in AUDIENCES if (a.get("platform") or "").lower() == platform.lower()),
            "data": [a for a in AUDIENCES if (a.get("platform") or "").lower() == platform.lower()]
        }
    return {
        "creator_id": 1,
        "platform_filter": "All",
        "total_records": len(AUDIENCES),
        "total_followers": sum(a.get("followers", 0) for a in AUDIENCES),
        "total_reach": sum(a.get("reach", 0) for a in AUDIENCES),
        "total_impressions": sum(a.get("impressions", 0) for a in AUDIENCES),
        "data": AUDIENCES
    }

@app.get("/reports/revenue", tags=["reports"], summary="Get Revenue Analytics Report")
def get_revenue_report_tag(platform: Optional[str] = None):
    filtered = REVENUES
    if is_valid_platform(platform):
        filtered = [r for r in REVENUES if (r.get("platform") or "").lower() == platform.lower() or r.get("platform") == "Multi-Platform"]
    return {
        "creator_id": 1,
        "platform_filter": platform or "All",
        "total_records": len(filtered),
        "total_revenue": sum(r.get("amount", 0) for r in filtered),
        "data": filtered
    }

@app.get("/reports/growth", tags=["reports"], summary="Get Audience Growth Report")
def get_growth_report_tag(platform: Optional[str] = None):
    platform_weights = {
        "youtube": 0.258,
        "instagram": 0.231,
        "tiktok": 0.226,
        "linkedin": 0.110,
        "x": 0.084,
        "facebook": 0.091
    }
    if is_valid_platform(platform) and platform.lower() in platform_weights:
        w = platform_weights[platform.lower()]
        scaled = [
            {"id": g["id"], "creator_id": 1, "date": g["date"], "followers": int(g["followers"] * w), "reach": int(g["reach"] * w)}
            for g in GROWTHS
        ]
        return {"creator_id": 1, "platform_filter": platform, "total_records": len(scaled), "data": scaled}
    return {
        "creator_id": 1,
        "platform_filter": "All",
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
def dashboard_overview_tag(platform: Optional[str] = None):
    filtered_c = CONTENTS
    if is_valid_platform(platform):
        filtered_c = [c for c in CONTENTS if (c.get("platform") or "").lower() == platform.lower()]
    filtered_r = REVENUES
    if is_valid_platform(platform):
        filtered_r = [r for r in REVENUES if (r.get("platform") or "").lower() == platform.lower() or r.get("platform") == "Multi-Platform"]
    return {
        "creator": USERS[0],
        "total_views": sum(c.get("views", 0) for c in filtered_c),
        "total_posts": len(filtered_c),
        "connected_platforms": 6 if not is_valid_platform(platform) else 1,
        "total_revenue": sum(r.get("amount", 0) for r in filtered_r)
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
