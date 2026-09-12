"""
Content + analytics tests. DB setup/override lives in conftest.py.
"""


def get_auth_headers(client, email="creator@test.com"):
    client.post(
        "/api/auth/register",
        json={"name": "Creator One", "email": email, "password": "test1234"},
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


def test_create_content_and_engagement_rate(client):
    headers = get_auth_headers(client)
    # likes+comments+shares+saves = 80+10+5+5 = 100; reach = 1000 -> 10%
    response = make_content(client, headers)
    assert response.status_code == 201
    data = response.json()
    assert data["engagement_rate"] == 10.0


def test_engagement_rate_zero_reach_does_not_crash(client):
    headers = get_auth_headers(client)
    response = make_content(client, headers, reach=0, likes=5)
    assert response.status_code == 201
    assert response.json()["engagement_rate"] == 0.0


def test_analytics_routes_not_shadowed_by_content_id_route(client):
    """
    Regression test: /content/analytics/summary must NOT be matched
    by the /content/{content_id} route (route ordering bug class).
    """
    headers = get_auth_headers(client)
    make_content(client, headers)
    response = client.get("/api/content/analytics/summary", headers=headers)
    assert response.status_code == 200
    assert response.json()["total_content"] == 1


def test_kpi_summary_aggregates_correctly(client):
    headers = get_auth_headers(client)
    make_content(client, headers, reach=1000, likes=80, comments=10, shares=5, saves=5)  # 10%
    make_content(client, headers, reach=500, likes=50, comments=0, shares=0, saves=0)  # 10%
    response = client.get("/api/content/analytics/summary", headers=headers)
    data = response.json()
    assert data["total_content"] == 2
    assert data["total_reach"] == 1500
    assert data["avg_engagement_rate"] == 10.0


def test_top_performing_sorted_by_engagement_rate(client):
    headers = get_auth_headers(client)
    make_content(client, headers, title="Low", reach=1000, likes=10, comments=0, shares=0, saves=0)  # 1%
    make_content(client, headers, title="High", reach=1000, likes=500, comments=0, shares=0, saves=0)  # 50%
    response = client.get("/api/content/analytics/top-performing", headers=headers)
    results = response.json()
    assert results[0]["title"] == "High"
    assert results[0]["engagement_rate"] == 50.0


def test_platform_comparison_groups_correctly(client):
    headers = get_auth_headers(client)
    make_content(client, headers, platform="youtube")
    make_content(client, headers, platform="instagram")
    response = client.get("/api/content/analytics/platform-comparison", headers=headers)
    platforms = {item["platform"] for item in response.json()}
    assert platforms == {"youtube", "instagram"}


def test_creator_cannot_access_another_creators_content(client):
    headers_a = get_auth_headers(client, "creator_a@test.com")
    headers_b = get_auth_headers(client, "creator_b@test.com")

    created = make_content(client, headers_a)
    content_id = created.json()["id"]

    response = client.get(f"/api/content/{content_id}", headers=headers_b)
    assert response.status_code == 404


def test_date_filtering(client):
    headers = get_auth_headers(client)
    make_content(client, headers, publish_date="2026-01-01T00:00:00")
    make_content(client, headers, publish_date="2026-06-01T00:00:00")

    response = client.get(
        "/api/content/?start_date=2026-05-01T00:00:00", headers=headers
    )
    data = response.json()
    assert data["total"] == 1


def test_delete_content(client):
    headers = get_auth_headers(client)
    created = make_content(client, headers)
    content_id = created.json()["id"]

    delete_resp = client.delete(f"/api/content/{content_id}", headers=headers)
    assert delete_resp.status_code == 204

    get_resp = client.get(f"/api/content/{content_id}", headers=headers)
    assert get_resp.status_code == 404


def test_content_requires_auth(client):
    response = client.get("/api/content/")
    assert response.status_code == 401
