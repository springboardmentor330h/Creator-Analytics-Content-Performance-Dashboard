import unittest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from backend.app.main import app
from backend.app.db.database import Base, get_db
from backend.app.models import Audience, Growth

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


class TestAudienceAndGrowth(unittest.TestCase):

    def setUp(self):
        app.dependency_overrides[get_db] = override_get_db
        Base.metadata.create_all(bind=engine)
        self.db = TestingSessionLocal()
        self.db.query(Audience).delete()
        self.db.query(Growth).delete()
        self.db.commit()

    def tearDown(self):
        self.db.query(Audience).delete()
        self.db.query(Growth).delete()
        self.db.commit()
        self.db.close()

    def test_create_audience_success(self):
        payload = {
            "creator_id": 1,
            "age_group": "18-24",
            "gender": "Female",
            "country": "India",
            "city": "Bangalore",
            "device_type": "Mobile",
            "active_hour": 18,
            "followers": 125000,
            "impressions": 720000,
            "reach": 450000
        }
        response = client.post("/audience", json=payload)
        self.assertEqual(response.status_code, 201)
        data = response.json()
        self.assertEqual(data["creator_id"], 1)
        self.assertEqual(data["city"], "Bangalore")
        self.assertEqual(data["followers"], 125000)

    def test_audience_validation_errors(self):
        # Negative followers
        res1 = client.post("/audience", json={"creator_id": 1, "followers": -10})
        self.assertEqual(res1.status_code, 422)

        # Invalid active_hour > 23
        res2 = client.post("/audience", json={"creator_id": 1, "active_hour": 25})
        self.assertEqual(res2.status_code, 422)

        # Negative active_hour
        res3 = client.post("/audience", json={"creator_id": 1, "active_hour": -1})
        self.assertEqual(res3.status_code, 422)

        # Negative reach
        res4 = client.post("/audience", json={"creator_id": 1, "reach": -5})
        self.assertEqual(res4.status_code, 422)

        # Negative impressions
        res5 = client.post("/audience", json={"creator_id": 1, "impressions": -100})
        self.assertEqual(res5.status_code, 422)

    def test_growth_validation_errors(self):
        # Negative engagement_rate
        res = client.post("/growth", json={
            "creator_id": 1,
            "date": "2026-08-01",
            "followers": 100,
            "reach": 200,
            "engagement_rate": -1.5
        })
        self.assertEqual(res.status_code, 422)

    def test_audience_crud(self):
        # 1. Create
        res_create = client.post("/audience", json={
            "creator_id": 1,
            "age_group": "25-34",
            "gender": "Male",
            "country": "India",
            "city": "Mumbai",
            "device_type": "Desktop",
            "active_hour": 20,
            "followers": 50000,
            "impressions": 150000,
            "reach": 100000
        })
        self.assertEqual(res_create.status_code, 201)
        aud_id = res_create.json()["id"]

        # 2. Get All
        res_get_all = client.get("/audience")
        self.assertEqual(res_get_all.status_code, 200)
        self.assertEqual(len(res_get_all.json()), 1)

        # 3. Get By ID
        res_get_id = client.get(f"/audience/{aud_id}")
        self.assertEqual(res_get_id.status_code, 200)
        self.assertEqual(res_get_id.json()["city"], "Mumbai")

        # 4. Update
        res_update = client.put(f"/audience/{aud_id}", json={
            "followers": 60000,
            "city": "Delhi"
        })
        self.assertEqual(res_update.status_code, 200)
        self.assertEqual(res_update.json()["followers"], 60000)
        self.assertEqual(res_update.json()["city"], "Delhi")

        # 5. Delete
        res_delete = client.delete(f"/audience/{aud_id}")
        self.assertEqual(res_delete.status_code, 200)

        # Verify not found after delete
        res_get_deleted = client.get(f"/audience/{aud_id}")
        self.assertEqual(res_get_deleted.status_code, 404)

    def test_audience_analytics_report(self):
        # Seed 2 audience records
        client.post("/audience", json={
            "creator_id": 1,
            "age_group": "18-24",
            "gender": "Male",
            "country": "India",
            "city": "Bangalore",
            "device_type": "Mobile",
            "active_hour": 18,
            "followers": 58000,
            "impressions": 400000,
            "reach": 250000
        })
        client.post("/audience", json={
            "creator_id": 1,
            "age_group": "25-34",
            "gender": "Female",
            "country": "India",
            "city": "Bangalore",
            "device_type": "Mobile",
            "active_hour": 20,
            "followers": 42000,
            "impressions": 320000,
            "reach": 200000
        })

        res = client.get("/analytics/audience")
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertEqual(data["total_followers"], 100000)
        self.assertEqual(data["total_reach"], 450000)
        self.assertEqual(data["total_impressions"], 720000)
        self.assertEqual(data["gender_distribution"]["male"], 58.0)
        self.assertEqual(data["gender_distribution"]["female"], 42.0)
        self.assertEqual(data["top_country"], "India")
        self.assertEqual(data["top_city"], "Bangalore")
        self.assertEqual(data["top_device"], "Mobile")

    def test_growth_analytics_and_trends(self):
        # Seed 2 growth records
        client.post("/growth", json={
            "creator_id": 1,
            "date": "2026-08-01",
            "followers": 120000,
            "reach": 15000,
            "engagement_rate": 2.5
        })
        client.post("/growth", json={
            "creator_id": 1,
            "date": "2026-08-02",
            "followers": 120850,
            "reach": 16200,
            "engagement_rate": 2.7
        })

        # Growth report
        res_growth = client.get("/analytics/growth")
        self.assertEqual(res_growth.status_code, 200)
        growth_data = res_growth.json()
        self.assertEqual(len(growth_data), 2)
        self.assertEqual(growth_data[0]["date"], "2026-08-01")
        self.assertEqual(growth_data[0]["daily_growth"], 0)
        self.assertEqual(growth_data[1]["date"], "2026-08-02")
        self.assertEqual(growth_data[1]["daily_growth"], 850)

        # Audience trends
        res_trends = client.get("/analytics/audience-trends")
        self.assertEqual(res_trends.status_code, 200)
        trends_data = res_trends.json()
        self.assertEqual(len(trends_data), 2)
        self.assertEqual(trends_data[0]["followers"], 120000)
        self.assertEqual(trends_data[0]["reach"], 15000)
        self.assertEqual(trends_data[1]["followers"], 120850)
        self.assertEqual(trends_data[1]["reach"], 16200)


if __name__ == "__main__":
    unittest.main()
