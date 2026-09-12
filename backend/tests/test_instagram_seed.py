"""
Tests for the Instagram sample-data service: realistic generation,
internal consistency, idempotent re-seeding, and integration with the
existing platform analytics/content/audience services.
"""


def get_auth_headers(client, email="ig_creator@test.com"):
    client.post(
        "/api/auth/register",
        json={"name": "IG Creator", "email": email, "password": "test1234"},
    )
    login = client.post("/api/auth/login", json={"email": email, "password": "test1234"})
    return {"Authorization": f"Bearer {login.json()['access_token']}"}


def test_seed_creates_expected_number_of_posts(client):
    headers = get_auth_headers(client)
    response = client.post("/api/instagram/seed", json={"num_posts": 20}, headers=headers)
    assert response.status_code == 200
    data = response.json()
    assert data["posts_created"] == 20
    assert data["posts_updated"] == 0
    assert data["growth_points_created"] > 0


def test_seed_requires_auth(client):
    response = client.post("/api/instagram/seed", json={"num_posts": 20})
    assert response.status_code == 401


def test_reseeding_updates_instead_of_duplicating(client):
    """Idempotency check -- same requirement as YouTube sync (Sprint 5):
    running the seed twice must not double the row count."""
    headers = get_auth_headers(client)
    client.post("/api/instagram/seed", json={"num_posts": 15}, headers=headers)

    second = client.post("/api/instagram/seed", json={"num_posts": 15}, headers=headers)
    assert second.json()["posts_created"] == 0
    assert second.json()["posts_updated"] == 15

    content_list = client.get("/api/content/?platform=instagram&limit=100", headers=headers).json()
    assert content_list["total"] == 15


def test_seeded_data_flows_through_existing_content_analytics(client):
    """Verifies seeded Instagram content is visible through the SAME
    content_service endpoints YouTube/manual content already uses --
    proving no duplicate analytics path was created for Instagram."""
    headers = get_auth_headers(client)
    client.post("/api/instagram/seed", json={"num_posts": 25}, headers=headers)

    summary = client.get("/api/content/analytics/summary", headers=headers).json()
    assert summary["total_content"] == 25
    assert summary["avg_engagement_rate"] > 0


def test_seeded_engagement_rate_is_realistic_not_nonsensical(client):
    headers = get_auth_headers(client)
    client.post("/api/instagram/seed", json={"num_posts": 30}, headers=headers)

    content_list = client.get("/api/content/?platform=instagram&limit=100", headers=headers).json()
    for item in content_list["items"]:
        assert 0 < item["engagement_rate"] < 20


def test_seeded_impressions_never_less_than_reach(client):
    headers = get_auth_headers(client)
    client.post("/api/instagram/seed", json={"num_posts": 20}, headers=headers)

    content_list = client.get("/api/content/?platform=instagram&limit=100", headers=headers).json()
    for item in content_list["items"]:
        assert item["impressions"] >= item["reach"]


def test_seeded_follower_growth_is_positive_trending(client):
    headers = get_auth_headers(client)
    client.post("/api/instagram/seed", json={"num_posts": 20}, headers=headers)

    trend = client.get("/api/audience/growth/trend?platform=instagram", headers=headers).json()
    assert len(trend) > 1
    assert trend[-1]["follower_count"] >= trend[0]["follower_count"]


def test_instagram_snapshot_reflects_seeded_data_in_platform_comparison(client):
    headers = get_auth_headers(client)
    client.post("/api/instagram/seed", json={"num_posts": 20}, headers=headers)

    snapshot = client.get("/api/platforms/instagram", headers=headers).json()
    assert snapshot["is_mock_data"] is False
    assert snapshot["total_content"] == 20
    assert snapshot["followers"] > 0


def test_seed_respects_num_posts_bounds(client):
    headers = get_auth_headers(client)
    response = client.post("/api/instagram/seed", json={"num_posts": 2}, headers=headers)
    assert response.status_code == 422

    response2 = client.post("/api/instagram/seed", json={"num_posts": 500}, headers=headers)
    assert response2.status_code == 422


def test_creator_isolation_on_seeded_instagram_data(client):
    headers_a = get_auth_headers(client, "ig_a@test.com")
    headers_b = get_auth_headers(client, "ig_b@test.com")

    client.post("/api/instagram/seed", json={"num_posts": 15}, headers=headers_a)

    content_b = client.get("/api/content/?platform=instagram&limit=100", headers=headers_b).json()
    assert content_b["total"] == 0
