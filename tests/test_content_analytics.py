from fastapi.testclient import TestClient

from app.main import app


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
