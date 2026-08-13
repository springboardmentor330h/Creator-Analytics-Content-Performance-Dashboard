import unittest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from backend.app.main import app
from backend.app.db.database import Base, get_db
from backend.app.models.content import Content
from backend.app.services.analytics_service import AnalyticsService

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

app.dependency_overrides[get_db] = override_get_db

client = TestClient(app)

class TestAnalytics(unittest.TestCase):

    def setUp(self):
        Base.metadata.create_all(bind=engine)
        self.db = TestingSessionLocal()
        self.db.query(Content).delete()
        self.db.commit()

        # Seed content
        c1 = Content(
            creator_id=1,
            platform="YouTube",
            content_title="FastAPI Tutorial",
            views=12000,
            likes=600,
            comments=300,
            shares=100,
            saves=20,
            watch_time=3000,
            reach=15000
        )
        c2 = Content(
            creator_id=1,
            platform="YouTube",
            content_title="Python Advanced",
            views=5000,
            likes=200,
            comments=100,
            shares=50,
            saves=10,
            watch_time=1500,
            reach=6000
        )
        c3 = Content(
            creator_id=1,
            platform="Instagram",
            content_title="Tech Tips Reel",
            views=15000,
            likes=500,
            comments=200,
            shares=100,
            saves=100,
            watch_time=800,
            reach=10000
        )
        c4 = Content(
            creator_id=1,
            platform="LinkedIn",
            content_title="Career Guide",
            views=4000,
            likes=100,
            comments=50,
            shares=20,
            saves=5,
            watch_time=500,
            reach=5000
        )

        self.db.add_all([c1, c2, c3, c4])
        self.db.commit()

    def tearDown(self):
        self.db.close()
        Base.metadata.drop_all(bind=engine)

    def test_calculate_engagement_rate_unit(self):
        rate = AnalyticsService.calculate_engagement_rate(600, 300, 100, 20, 15000)
        self.assertEqual(rate, 6.8)

        zero_reach_rate = AnalyticsService.calculate_engagement_rate(100, 50, 10, 5, 0)
        self.assertEqual(zero_reach_rate, 0.0)

    def test_get_content_engagement_success(self):
        response = client.get("/analytics/content/1/engagement")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["content_id"], 1)
        self.assertEqual(data["platform"], "YouTube")
        self.assertEqual(data["views"], 12000)
        self.assertEqual(data["reach"], 15000)
        self.assertEqual(data["total_engagement"], 1020)
        self.assertEqual(data["engagement_rate"], 6.8)

    def test_get_content_engagement_not_found(self):
        response = client.get("/analytics/content/999/engagement")
        self.assertEqual(response.status_code, 404)
        self.assertEqual(response.json()["detail"], "Content not found")

    def test_get_top_content(self):
        response = client.get("/analytics/top-content")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(len(data), 4)
        self.assertEqual(data[0]["content_title"], "Tech Tips Reel")
        self.assertEqual(data[0]["engagement_rate"], 9.0)
        self.assertEqual(data[1]["content_title"], "FastAPI Tutorial")
        self.assertEqual(data[1]["engagement_rate"], 6.8)

    def test_get_platform_performance(self):
        response = client.get("/analytics/platform-performance")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(len(data), 3)

        yt = next(p for p in data if p["platform"] == "YouTube")
        self.assertEqual(yt["total_views"], 17000)
        self.assertEqual(yt["total_likes"], 800)
        self.assertEqual(yt["total_comments"], 400)
        self.assertEqual(yt["total_reach"], 21000)
        self.assertEqual(yt["average_engagement_rate"], 6.4)

        ig = next(p for p in data if p["platform"] == "Instagram")
        self.assertEqual(ig["total_views"], 15000)
        self.assertEqual(ig["average_engagement_rate"], 9.0)

    def test_get_dashboard_summary(self):
        response = client.get("/analytics/summary")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["total_content"], 4)
        self.assertEqual(data["total_views"], 36000)
        self.assertEqual(data["total_reach"], 36000)
        self.assertEqual(data["average_engagement_rate"], 6.33)
        self.assertEqual(data["best_platform"], "Instagram")
        self.assertEqual(data["top_content"], "Tech Tips Reel")

if __name__ == "__main__":
    unittest.main()
