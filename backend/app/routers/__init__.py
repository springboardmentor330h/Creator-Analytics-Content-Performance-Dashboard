from fastapi import APIRouter
from backend.app.routers import auth, reports, content, audience, revenue, growth, sponsorships, notifications

__all__ = ["auth", "reports", "content", "audience", "revenue", "growth", "sponsorships", "notifications"]
