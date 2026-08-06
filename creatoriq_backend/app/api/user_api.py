"""Backward-compatible export of the secured user router.

New code should import from :mod:`app.routers.users` directly.
"""
from app.routers.users import router

__all__ = ["router"]
