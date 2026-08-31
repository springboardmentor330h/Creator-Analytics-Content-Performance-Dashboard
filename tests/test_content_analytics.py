from fastapi.testclient import TestClient

from app.db.database import SessionLocal
from app.main import app
from app.models.content import Content
from app.models.user import User
from app.services.analytics_service import AnalyticsService


client = TestClient(app)


def test_content_analytics_overview_endpoint():
    response = client.get("/content-analytics/overview")

    assert response.status_code == 200
    data = response.json()
    assert data["total_views"] > 0
    assert data["top_performing_video"]


def test_youtube_dashboard_endpoint():
    response = client.get("/youtube/dashboard")

    assert response.status_code == 200
    data = response.json()
    assert "videos" in data
    assert len(data["videos"]) > 0


def test_instagram_summary_is_case_insensitive_for_platform_filter():
    db = SessionLocal()
    try:
        user = db.query(User).filter(User.email == "demo@creatoriq.com").first()
        if not user:
            user = User(email="demo@creatoriq.com", full_name="Demo Creator", hashed_password="placeholder")
            db.add(user)
            db.commit()
            db.refresh(user)

        db.query(Content).filter(Content.creator_id == user.id).delete()

        row = Content(
            creator_id=user.id,
            platform="instagram",
            content_title="Case-Insensitive Instagram Content",
            views=42000,
            likes=5200,
            comments=340,
            shares=210,
            saves=180,
            reach=58000,
            published_date="2024-01-15",
        )
        db.add(row)
        db.commit()

        summary = AnalyticsService.get_kpi_summary(db, creator_id=user.id, platform="Instagram")

        assert summary["platform"] == "Instagram"
        assert summary["total_views"] == 42000
        assert summary["total_likes"] == 5200
    finally:
        db.query(Content).filter(Content.content_title == "Case-Insensitive Instagram Content").delete()
        db.commit()
        db.close()


def test_dynamic_channel_summary_uses_user_entered_video_data():
    payload = {
        "channel_name": "Creator Corner",
        "platform": "YouTube",
        "videos": [
            {"title": "Intro video", "views": 125000, "likes": 15000, "comments": 1100, "shares": 900, "reach": 220000},
            {"title": "Growth tips", "views": 95000, "likes": 12000, "comments": 800, "shares": 700, "reach": 180000},
        ],
    }

    response = client.post("/analytics/dynamic", json=payload)

    assert response.status_code == 200
    data = response.json()
    assert data["channel_name"] == "Creator Corner"
    assert data["total_views"] == 220000
    assert data["total_likes"] == 27000
    assert data["total_comments"] == 1900
    assert data["total_shares"] == 1600
    assert data["average_engagement_rate"] > 0


def test_youtube_channel_endpoint_accepts_api_key_and_channel_name():
    response = client.get("/social/youtube/channel?channel_name=Creator%20Corner&api_key=test-key")

    assert response.status_code == 200
    data = response.json()
    assert data["platform"] == "YouTube"
    assert data["channel_name"] == "Creator Corner"
