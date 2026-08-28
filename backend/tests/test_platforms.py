import unittest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from backend.app.main import app
from backend.app.db.database import Base, get_db
from backend.app.models.user import User
from backend.app.core.security import hash_password
from backend.app.core.jwt import create_access_token
from backend.app.services.instagram_service import InstagramService
from backend.app.services.social_media import SocialMediaService

SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"
engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()

class TestPlatformsModule(unittest.TestCase):

    @classmethod
    def setUpClass(cls):
        app.dependency_overrides[get_db] = override_get_db
        Base.metadata.create_all(bind=engine)
        cls.client = TestClient(app)
        db = TestingSessionLocal()

        user = User(
            email="platform_test@creatoriq.com",
            full_name="Platform Test User",
            password=hash_password("password123")
        )
        db.add(user)
        db.commit()
        db.refresh(user)

        cls.test_user = user
        token = create_access_token(data={"sub": user.email, "user_id": user.id})
        cls.headers = {"Authorization": f"Bearer {token}"}
        db.close()

    @classmethod
    def tearDownClass(cls):
        Base.metadata.drop_all(bind=engine)

    def test_01_instagram_service_fetch_and_transform(self):
        items = InstagramService.fetch_instagram_media()
        self.assertGreater(len(items), 0)

        transformed = InstagramService.transform_to_creatoriq_format(items[0], creator_id=self.test_user.id)
        self.assertEqual(transformed["platform"], "Instagram")
        self.assertIn("views", transformed)
        self.assertIn("likes", transformed)
        self.assertIn("reach", transformed)

    def test_02_instagram_service_sync(self):
        db = TestingSessionLocal()
        res = InstagramService.sync_instagram_media(db, creator_id=self.test_user.id)
        self.assertEqual(res["status"], "success")
        self.assertGreater(res["records_synced"], 0)
        db.close()

    def test_03_get_connected_platforms_endpoint(self):
        resp = self.client.get("/social/platforms", headers=self.headers)
        self.assertEqual(resp.status_code, 200)
        data = resp.json()
        platforms_list = data if isinstance(data, list) else data.get("platforms", [])
        self.assertIn("Instagram", platforms_list)

    def test_04_sync_platform_endpoint(self):
        resp = self.client.post("/social/platforms/Instagram/sync", headers=self.headers)
        self.assertEqual(resp.status_code, 200)
        data = resp.json()
        self.assertEqual(data["platform"], "Instagram")

    def test_05_platform_comparison_endpoint(self):
        resp = self.client.get("/social/platforms/comparison", headers=self.headers)
        self.assertEqual(resp.status_code, 200)
        data = resp.json()
        self.assertIn("comparison", data)
        self.assertGreater(len(data["comparison"]), 0)

if __name__ == "__main__":
    unittest.main()
