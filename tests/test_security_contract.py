from fastapi.testclient import TestClient

from app.main import app


client = TestClient(app)


def test_domain_endpoints_require_authentication():
    protected_paths = [
        ("get", "/content/"),
        ("get", "/audience"),
        ("get", "/analytics/audience"),
        ("get", "/revenue/creator/1"),
        ("get", "/sponsorship/creator/1"),
        ("get", "/notifications/creator/1"),
        ("get", "/reports/summary/1"),
        ("get", "/reports/export/pdf/1"),
        ("post", "/social/sync"),
    ]

    for method, path in protected_paths:
        response = client.post(path, json={}) if method == "post" else client.get(path)
        assert response.status_code == 401, (method, path, response.text)