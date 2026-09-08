"""
Revenue and sponsorship tests: CRUD, the pending-vs-received revenue
distinction, breakdown analytics, and creator isolation.
"""


def get_auth_headers(client, email="rev_creator@test.com"):
    client.post(
        "/api/auth/register",
        json={"name": "Revenue Creator", "email": email, "password": "test1234"},
    )
    login = client.post("/api/auth/login", json={"email": email, "password": "test1234"})
    return {"Authorization": f"Bearer {login.json()['access_token']}"}


def make_revenue(client, headers, **overrides):
    payload = {
        "source": "youtube",
        "amount": 500.0,
        "currency": "USD",
        "date": "2026-01-15",
        "revenue_type": "ad_revenue",
        "status": "received",
    }
    payload.update(overrides)
    return client.post("/api/revenue/", json=payload, headers=headers)


def make_sponsorship(client, headers, **overrides):
    payload = {
        "brand": "Acme Corp",
        "campaign": "Spring Launch",
        "amount": 2000.0,
        "status": "active",
        "start_date": "2026-01-01",
    }
    payload.update(overrides)
    return client.post("/api/sponsorships/", json=payload, headers=headers)


def test_create_revenue(client):
    headers = get_auth_headers(client)
    response = make_revenue(client, headers)
    assert response.status_code == 201
    assert response.json()["amount"] == 500.0


def test_negative_amount_rejected(client):
    headers = get_auth_headers(client)
    response = make_revenue(client, headers, amount=-100)
    assert response.status_code == 422


def test_pending_revenue_excluded_from_total_revenue(client):
    headers = get_auth_headers(client)
    make_revenue(client, headers, amount=500.0, status="received")
    make_revenue(client, headers, amount=300.0, status="pending")

    response = client.get("/api/revenue/analytics/summary", headers=headers)
    data = response.json()
    assert data["total_revenue"] == 500.0  # only received
    assert data["pending_revenue"] == 300.0  # tracked separately


def test_cancelled_revenue_excluded_from_both_totals(client):
    headers = get_auth_headers(client)
    make_revenue(client, headers, amount=500.0, status="received")
    make_revenue(client, headers, amount=999.0, status="cancelled")

    response = client.get("/api/revenue/analytics/summary", headers=headers)
    data = response.json()
    assert data["total_revenue"] == 500.0
    assert data["pending_revenue"] == 0.0


def test_monthly_revenue_trend_groups_by_month(client):
    headers = get_auth_headers(client)
    make_revenue(client, headers, amount=100.0, date="2026-01-10")
    make_revenue(client, headers, amount=200.0, date="2026-01-20")
    make_revenue(client, headers, amount=50.0, date="2026-02-05")

    response = client.get("/api/revenue/analytics/monthly-trend", headers=headers)
    data = response.json()
    jan = next(d for d in data if d["month"] == "2026-01")
    feb = next(d for d in data if d["month"] == "2026-02")
    assert jan["total"] == 300.0
    assert feb["total"] == 50.0


def test_revenue_by_platform_breakdown(client):
    headers = get_auth_headers(client)
    make_revenue(client, headers, source="youtube", amount=300.0)
    make_revenue(client, headers, source="instagram", amount=150.0)

    response = client.get("/api/revenue/analytics/by-platform", headers=headers)
    sources = {item["source"]: item["total"] for item in response.json()}
    assert sources["youtube"] == 300.0
    assert sources["instagram"] == 150.0


def test_analytics_routes_not_shadowed_by_revenue_id_route(client):
    headers = get_auth_headers(client)
    make_revenue(client, headers)
    response = client.get("/api/revenue/analytics/summary", headers=headers)
    assert response.status_code == 200
    assert "total_revenue" in response.json()


def test_update_revenue_status(client):
    headers = get_auth_headers(client)
    created = make_revenue(client, headers, status="pending")
    revenue_id = created.json()["id"]

    response = client.put(
        f"/api/revenue/{revenue_id}", json={"status": "received"}, headers=headers
    )
    assert response.status_code == 200
    assert response.json()["status"] == "received"


def test_delete_revenue(client):
    headers = get_auth_headers(client)
    created = make_revenue(client, headers)
    revenue_id = created.json()["id"]

    delete_resp = client.delete(f"/api/revenue/{revenue_id}", headers=headers)
    assert delete_resp.status_code == 204

    get_resp = client.get(f"/api/revenue/{revenue_id}", headers=headers)
    assert get_resp.status_code == 404


def test_creator_cannot_access_another_creators_revenue(client):
    headers_a = get_auth_headers(client, "rev_a@test.com")
    headers_b = get_auth_headers(client, "rev_b@test.com")

    created = make_revenue(client, headers_a)
    revenue_id = created.json()["id"]

    response = client.get(f"/api/revenue/{revenue_id}", headers=headers_b)
    assert response.status_code == 404


# ---------- Sponsorships ----------

def test_create_sponsorship(client):
    headers = get_auth_headers(client)
    response = make_sponsorship(client, headers)
    assert response.status_code == 201
    assert response.json()["brand"] == "Acme Corp"


def test_sponsorship_without_end_date_allowed(client):
    """Open-ended deals are valid — end_date is nullable."""
    headers = get_auth_headers(client)
    response = make_sponsorship(client, headers, end_date=None)
    assert response.status_code == 201
    assert response.json()["end_date"] is None


def test_list_sponsorships_filtered_by_status(client):
    headers = get_auth_headers(client)
    make_sponsorship(client, headers, status="active")
    make_sponsorship(client, headers, status="completed")

    response = client.get("/api/sponsorships/?status_filter=active", headers=headers)
    data = response.json()
    assert len(data) == 1
    assert data[0]["status"] == "active"


def test_sponsorship_status_update(client):
    headers = get_auth_headers(client)
    created = make_sponsorship(client, headers, status="pending")
    sponsorship_id = created.json()["id"]

    response = client.put(
        f"/api/sponsorships/{sponsorship_id}", json={"status": "active"}, headers=headers
    )
    assert response.status_code == 200
    assert response.json()["status"] == "active"


def test_active_sponsorships_count_in_kpi_summary(client):
    headers = get_auth_headers(client)
    make_sponsorship(client, headers, status="active", amount=1000)
    make_sponsorship(client, headers, status="active", amount=2000)
    make_sponsorship(client, headers, status="completed", amount=500)

    response = client.get("/api/revenue/analytics/summary", headers=headers)
    data = response.json()
    assert data["active_sponsorships"] == 2
    assert data["total_sponsorship_value"] == 3500.0  # includes completed too


def test_sponsorships_require_auth(client):
    response = client.get("/api/sponsorships/")
    assert response.status_code == 401


def test_creator_isolation_on_sponsorships(client):
    headers_a = get_auth_headers(client, "spon_a@test.com")
    headers_b = get_auth_headers(client, "spon_b@test.com")

    make_sponsorship(client, headers_a, brand="Secret Brand A")

    response_b = client.get("/api/sponsorships/", headers=headers_b)
    assert response_b.json() == []
