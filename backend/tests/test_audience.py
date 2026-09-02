"""
Audience tests: demographics breakdowns and growth-rate math.
Uses the shared conftest.py fixtures (client, autouse setup_db).
"""


def get_auth_headers(client, email="audience_creator@test.com"):
    client.post(
        "/api/auth/register",
        json={"name": "Audience Creator", "email": email, "password": "test1234"},
    )
    login = client.post("/api/auth/login", json={"email": email, "password": "test1234"})
    token = login.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


def make_demographic(client, headers, **overrides):
    payload = {
        "platform": "youtube",
        "snapshot_date": "2026-01-01",
        "age_group": "18-24",
        "gender": "female",
        "country": "India",
        "percentage": 40.0,
    }
    payload.update(overrides)
    return client.post("/api/audience/demographics", json=payload, headers=headers)


def make_growth(client, headers, **overrides):
    payload = {
        "platform": "youtube",
        "record_date": "2026-01-01",
        "follower_count": 1000,
    }
    payload.update(overrides)
    return client.post("/api/audience/growth", json=payload, headers=headers)


def test_create_demographic(client):
    headers = get_auth_headers(client)
    response = make_demographic(client, headers)
    assert response.status_code == 201
    assert response.json()["percentage"] == 40.0


def test_percentage_out_of_range_rejected(client):
    headers = get_auth_headers(client)
    response = make_demographic(client, headers, percentage=150.0)
    assert response.status_code == 422


def test_age_breakdown_averages_across_records(client):
    headers = get_auth_headers(client)
    make_demographic(client, headers, age_group="18-24", country="India", percentage=40.0)
    make_demographic(client, headers, age_group="18-24", country="USA", percentage=20.0)
    response = client.get("/api/audience/demographics/age-breakdown", headers=headers)
    data = response.json()
    assert len(data) == 1
    assert data[0]["label"] == "18-24"
    assert data[0]["percentage"] == 30.0  # avg of 40 and 20


def test_geographic_breakdown_sorted_descending(client):
    headers = get_auth_headers(client)
    make_demographic(client, headers, country="India", percentage=20.0)
    make_demographic(client, headers, country="USA", percentage=60.0)
    response = client.get("/api/audience/demographics/geographic-breakdown", headers=headers)
    data = response.json()
    assert data[0]["country"] == "USA"
    assert data[0]["percentage"] == 60.0


def test_empty_demographics_returns_empty_list_not_error(client):
    headers = get_auth_headers(client)
    response = client.get("/api/audience/demographics/age-breakdown", headers=headers)
    assert response.status_code == 200
    assert response.json() == []


def test_create_growth_record(client):
    headers = get_auth_headers(client)
    response = make_growth(client, headers)
    assert response.status_code == 201
    assert response.json()["follower_count"] == 1000


def test_growth_rate_calculation(client):
    headers = get_auth_headers(client)
    make_growth(client, headers, record_date="2026-01-01", follower_count=1000)
    make_growth(client, headers, record_date="2026-01-31", follower_count=1100)

    response = client.get(
        "/api/audience/growth/summary?platform=youtube&days=365", headers=headers
    )
    assert response.status_code == 200
    data = response.json()
    assert data["followers_gained"] == 100
    assert data["growth_rate_percent"] == 10.0


def test_growth_summary_no_data_returns_404(client):
    headers = get_auth_headers(client)
    response = client.get(
        "/api/audience/growth/summary?platform=tiktok&days=30", headers=headers
    )
    assert response.status_code == 404


def test_growth_rate_zero_start_does_not_crash(client):
    headers = get_auth_headers(client)
    make_growth(client, headers, record_date="2026-01-01", follower_count=0)
    make_growth(client, headers, record_date="2026-01-15", follower_count=50)

    response = client.get(
        "/api/audience/growth/summary?platform=youtube&days=365", headers=headers
    )
    data = response.json()
    assert data["growth_rate_percent"] == 0.0  # guarded, not a crash


def test_growth_trend_route_not_shadowed_by_summary_route(client):
    """Regression test: /growth/trend and /growth/summary must both resolve
    correctly and not collide (both are static path segments here, but this
    guards against future path-param additions breaking the order)."""
    headers = get_auth_headers(client)
    make_growth(client, headers)
    trend_resp = client.get("/api/audience/growth/trend?platform=youtube", headers=headers)
    assert trend_resp.status_code == 200
    assert len(trend_resp.json()) == 1


def test_audience_kpi_summary_aggregates_across_platforms(client):
    headers = get_auth_headers(client)
    make_growth(client, headers, platform="youtube", record_date="2026-01-01", follower_count=1000)
    make_growth(client, headers, platform="instagram", record_date="2026-01-01", follower_count=500)

    response = client.get("/api/audience/analytics/summary", headers=headers)
    data = response.json()
    assert data["total_followers"] == 1500


def test_audience_requires_auth(client):
    response = client.get("/api/audience/growth/trend")
    assert response.status_code == 401


def test_creator_isolation_on_growth_data(client):
    headers_a = get_auth_headers(client, "aud_a@test.com")
    headers_b = get_auth_headers(client, "aud_b@test.com")

    make_growth(client, headers_a, follower_count=5000)
    make_growth(client, headers_b, follower_count=10)

    response_b = client.get("/api/audience/growth/trend?platform=youtube", headers=headers_b)
    data = response_b.json()
    assert len(data) == 1
    assert data[0]["follower_count"] == 10  # never sees creator A's data
