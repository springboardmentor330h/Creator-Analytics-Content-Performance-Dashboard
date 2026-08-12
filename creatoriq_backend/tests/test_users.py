"""
Basic tests for the CreatorIQ API.
"""

from fastapi.testclient import TestClient

from app.main import app


# Create a FastAPI test client.
client = TestClient(app)


def test_root():
    """
    Test the root endpoint.
    """

    response = client.get("/")

    assert response.status_code == 200

    assert response.json()["message"] == (
        "CreatorIQ API is running"
    )


def test_health():
    """
    Test the health endpoint.
    """

    response = client.get("/health")

    assert response.status_code == 200

    assert response.json()["status"] == "healthy"