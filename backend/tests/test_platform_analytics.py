"""
Multi-platform analytics tests: mock data behavior, real-data usage,
route ordering, and cross-platform aggregation.
"""


def get_auth_headers(client, email="platform_creator@test.com"):
    client.post(
        "/api/auth/register",
        json={"name": "Platform Creator", "email": email, "password": "test1234"},
    )
    login = client.post("/api/auth/login", json={"email": email, "password": "test1234"})
    token = login.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


def make_content(client, headers, **overrides):
    payload = {
        "platform": "youtube",
        "content_type": "video",
        "title": "Test Video",
        "publish_date": "2026-01-15T10:00:00",
        "reach": 1000,
        "impressions": 1500,
        "likes": 80,
        "comments": 10,
        "shares": 5,
        "saves": 5,
        "views": 1200,
    }
    payload.update(overrides)
    return client.post("/api/content/", json=payload, headers=headers)


def make_growth(client, headers, **overrides):
    payload = {"platform": "youtube", "record_date": "2026-01-01", "follower_count": 1000}
    payload.update(overrides)
    return client.post("/api/audience/growth", json=payload, headers=headers)


def test_mock_platforms_are_labeled_as_mock(client):
    headers = get_auth_headers(client)
    response = client.get("/api/platforms/instagram", headers=headers)
    assert response.status_code == 200
    data = response.json()
    assert data["is_mock_data"] is True
    assert data["platform"] == "instagram"


def test_mock_data_is_stable_across_requests(client):
    """Same platform should return identical mock numbers on repeated
    calls within a session — a fixed seed, not random noise each time."""
    headers = get_auth_headers(client)
    first = client.get("/api/platforms/tiktok", headers=headers).json()
    second = client.get("/api/platforms/tiktok", headers=headers).json()
    assert first["followers"] == second["followers"]
    assert first["avg_engagement_rate"] == second["avg_engagement_rate"]


def test_youtube_uses_real_data_not_mock(client):
    headers = get_auth_headers(client)
    make_content(client, headers, reach=1000, likes=80, comments=10, shares=5, saves=5)
    make_growth(client, headers, follower_count=5000)

    response = client.get("/api/platforms/youtube", headers=headers)
    data = response.json()
    assert data["is_mock_data"] is False
    assert data["followers"] == 5000
    assert data["total_content"] == 1


def test_youtube_with_no_data_returns_zeros_not_error(client):
    headers = get_auth_headers(client)
    response = client.get("/api/platforms/youtube", headers=headers)
    assert response.status_code == 200
    data = response.json()
    assert data["followers"] == 0
    assert data["total_content"] == 0
    assert data["is_mock_data"] is False


def test_comparison_route_not_shadowed_by_platform_path_param(client):
    """Regression test: /platforms/comparison must resolve to the
    comparison endpoint, not be parsed as platform='comparison'."""
    headers = get_auth_headers(client)
    response = client.get("/api/platforms/comparison", headers=headers)
    assert response.status_code == 200
    platforms = {item["platform"] for item in response.json()}
    assert platforms == {"youtube", "instagram", "tiktok"}


def test_summary_route_not_shadowed(client):
    headers = get_auth_headers(client)
    response = client.get("/api/platforms/summary", headers=headers)
    assert response.status_code == 200
    assert "total_followers" in response.json()


def test_invalid_platform_returns_422(client):
    headers = get_auth_headers(client)
    response = client.get("/api/platforms/notarealplatform", headers=headers)
    assert response.status_code == 422


def test_cross_platform_kpis_sum_all_platforms(client):
    headers = get_auth_headers(client)
    make_growth(client, headers, follower_count=1000)

    response = client.get("/api/platforms/summary", headers=headers)
    data = response.json()
    # total_followers should include YouTube's real 1000 plus mock
    # instagram/tiktok followers, so it must be > 1000
    assert data["total_followers"] > 1000
    assert data["platforms_tracked"] == 3


def test_growth_comparison_includes_all_platforms(client):
    headers = get_auth_headers(client)
    response = client.get("/api/platforms/growth-comparison", headers=headers)
    platforms = {item["platform"] for item in response.json()}
    assert platforms == {"youtube", "instagram", "tiktok"}


def test_engagement_comparison_youtube_zero_when_no_content(client):
    headers = get_auth_headers(client)
    response = client.get("/api/platforms/engagement-comparison", headers=headers)
    youtube_entry = next(i for i in response.json() if i["platform"] == "youtube")
    assert youtube_entry["avg_engagement_rate"] == 0.0


def test_platform_analytics_requires_auth(client):
    response = client.get("/api/platforms/comparison")
    assert response.status_code == 401


def test_creator_isolation_on_platform_snapshot(client):
    headers_a = get_auth_headers(client, "plat_a@test.com")
    headers_b = get_auth_headers(client, "plat_b@test.com")

    make_growth(client, headers_a, follower_count=99999)
    make_growth(client, headers_b, follower_count=1)

    response_b = client.get("/api/platforms/youtube", headers=headers_b)
    assert response_b.json()["followers"] == 1
