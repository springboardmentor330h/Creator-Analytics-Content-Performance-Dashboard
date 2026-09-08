"""
Auth flow tests. DB setup/override lives in conftest.py, shared by all
test files, so tests here can't collide with tests in other files.
"""


def test_register_new_user(client):
    response = client.post(
        "/api/auth/register",
        json={"name": "Lavanya", "email": "lavanya@test.com", "password": "test1234"},
    )
    assert response.status_code == 201
    data = response.json()
    assert data["email"] == "lavanya@test.com"
    assert "password" not in data  # must never leak password/hash


def test_register_duplicate_email_fails(client):
    client.post(
        "/api/auth/register",
        json={"name": "User A", "email": "dup@test.com", "password": "test1234"},
    )
    response = client.post(
        "/api/auth/register",
        json={"name": "User B", "email": "dup@test.com", "password": "test5678"},
    )
    assert response.status_code == 400


def test_login_success_and_failure(client):
    client.post(
        "/api/auth/register",
        json={"name": "Login Test", "email": "login@test.com", "password": "correctpw"},
    )

    good = client.post(
        "/api/auth/login", json={"email": "login@test.com", "password": "correctpw"}
    )
    assert good.status_code == 200
    assert "access_token" in good.json()

    bad = client.post(
        "/api/auth/login", json={"email": "login@test.com", "password": "wrongpw"}
    )
    assert bad.status_code == 401


def test_protected_route_requires_token(client):
    response = client.get("/api/users/me")
    assert response.status_code == 401


def test_protected_route_with_valid_token(client):
    client.post(
        "/api/auth/register",
        json={"name": "Protected", "email": "protected@test.com", "password": "test1234"},
    )
    login_resp = client.post(
        "/api/auth/login", json={"email": "protected@test.com", "password": "test1234"}
    )
    token = login_resp.json()["access_token"]

    response = client.get(
        "/api/users/me", headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == 200
    assert response.json()["email"] == "protected@test.com"
