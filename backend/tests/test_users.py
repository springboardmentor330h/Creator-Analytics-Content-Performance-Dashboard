import unittest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from backend.app.main import app
from backend.app.db.database import Base, get_db
from backend.app.models import User

SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()


client = TestClient(app)


class TestUsersAndAuth(unittest.TestCase):

    def setUp(self):
        app.dependency_overrides[get_db] = override_get_db
        Base.metadata.create_all(bind=engine)
        self.db = TestingSessionLocal()
        self.db.query(User).delete()
        self.db.commit()

    def tearDown(self):
        self.db.query(User).delete()
        self.db.commit()
        self.db.close()

    def test_register_user_success(self):
        payload = {
            "full_name": "Test Creator",
            "email": "creator@test.com",
            "password": "Password123",
            "role": "creator"
        }
        res = client.post("/users/register", json=payload)
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertEqual(data["message"], "User registered successfully")
        self.assertEqual(data["user"]["email"], "creator@test.com")

    def test_register_duplicate_email(self):
        payload = {
            "full_name": "Test Creator",
            "email": "duplicate@test.com",
            "password": "Password123",
            "role": "creator"
        }
        res1 = client.post("/users/register", json=payload)
        self.assertEqual(res1.status_code, 200)

        res2 = client.post("/users/register", json=payload)
        self.assertEqual(res2.status_code, 400)
        self.assertEqual(res2.json()["detail"], "Email already registered")

    def test_login_success(self):
        # Register user
        client.post("/users/register", json={
            "full_name": "Login User",
            "email": "login@test.com",
            "password": "SecretPassword123",
            "role": "creator"
        })

        # Login
        res = client.post("/auth/login", json={
            "email": "login@test.com",
            "password": "SecretPassword123"
        })
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertIn("access_token", data)
        self.assertEqual(data["token_type"], "bearer")

    def test_login_invalid_credentials(self):
        res = client.post("/auth/login", json={
            "email": "unknown@test.com",
            "password": "WrongPassword"
        })
        self.assertEqual(res.status_code, 401)
        self.assertEqual(res.json()["detail"], "Invalid credentials")


if __name__ == "__main__":
    unittest.main()
