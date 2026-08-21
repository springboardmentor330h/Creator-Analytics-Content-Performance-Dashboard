import unittest
from datetime import date
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from backend.app.main import app
from backend.app.db.database import Base, get_db
from backend.app.models.user import User
from backend.app.models.revenue import Revenue
from backend.app.models.sponsorship import Sponsorship
from backend.app.core.jwt import create_access_token

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


class TestRevenueAndSponsorships(unittest.TestCase):

    def setUp(self):
        app.dependency_overrides[get_db] = override_get_db
        Base.metadata.create_all(bind=engine)
        self.db = TestingSessionLocal()

        # Clean DB
        self.db.query(Sponsorship).delete()
        self.db.query(Revenue).delete()
        self.db.query(User).delete()
        self.db.commit()

        # Create test creators
        self.creator1 = User(
            full_name="Creator One",
            email="creator1@test.com",
            password="hashedpassword123",
            role="creator"
        )
        self.creator2 = User(
            full_name="Creator Two",
            email="creator2@test.com",
            password="hashedpassword123",
            role="creator"
        )
        self.db.add(self.creator1)
        self.db.add(self.creator2)
        self.db.commit()
        self.db.refresh(self.creator1)
        self.db.refresh(self.creator2)

        self.token1 = create_access_token({"sub": self.creator1.email, "user_id": self.creator1.id})
        self.token2 = create_access_token({"sub": self.creator2.email, "user_id": self.creator2.id})
        self.headers1 = {"Authorization": f"Bearer {self.token1}"}
        self.headers2 = {"Authorization": f"Bearer {self.token2}"}

    def tearDown(self):
        self.db.query(Sponsorship).delete()
        self.db.query(Revenue).delete()
        self.db.query(User).delete()
        self.db.commit()
        self.db.close()

    def test_create_revenue_success(self):
        payload = {
            "source": "Sponsorships",
            "amount": 2500.00,
            "currency": "USD",
            "description": "Tech Brand Video Sponsor",
            "date": str(date.today())
        }
        res = client.post("/revenue", json=payload, headers=self.headers1)
        self.assertEqual(res.status_code, 201)
        data = res.json()
        self.assertEqual(data["amount"], 2500.00)
        self.assertEqual(data["source"], "Sponsorships")
        self.assertEqual(data["creator_id"], self.creator1.id)

    def test_get_revenue_list_and_filters(self):
        # Create 2 revenue items
        client.post("/revenue", json={
            "source": "Ad Revenue",
            "amount": 1200.00,
            "currency": "USD",
            "date": "2026-08-01"
        }, headers=self.headers1)

        client.post("/revenue", json={
            "source": "Subscription Revenue",
            "amount": 800.00,
            "currency": "USD",
            "date": "2026-08-15"
        }, headers=self.headers1)

        res = client.get("/revenue", headers=self.headers1)
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertEqual(len(data), 2)

        # Filter by source
        res_filter = client.get("/revenue?source=Ad%20Revenue", headers=self.headers1)
        self.assertEqual(res_filter.status_code, 200)
        filtered_data = res_filter.json()
        self.assertEqual(len(filtered_data), 1)
        self.assertEqual(filtered_data[0]["source"], "Ad Revenue")

    def test_update_and_delete_revenue(self):
        res = client.post("/revenue", json={
            "source": "Affiliate Marketing",
            "amount": 350.00,
            "currency": "USD",
            "date": "2026-08-10"
        }, headers=self.headers1)
        rev_id = res.json()["id"]

        # Update
        update_res = client.put(f"/revenue/{rev_id}", json={
            "amount": 500.00,
            "description": "Updated Affiliate Payout"
        }, headers=self.headers1)
        self.assertEqual(update_res.status_code, 200)
        self.assertEqual(update_res.json()["amount"], 500.00)

        # Delete
        del_res = client.delete(f"/revenue/{rev_id}", headers=self.headers1)
        self.assertEqual(del_res.status_code, 200)

        # Confirm deleted
        get_res = client.get(f"/revenue/{rev_id}", headers=self.headers1)
        self.assertEqual(get_res.status_code, 404)

    def test_create_and_manage_sponsorship(self):
        payload = {
            "brand_name": "Acme Corp",
            "campaign_name": "Summer Launch 2026",
            "contract_value": 5000.00,
            "start_date": "2026-08-01",
            "end_date": "2026-08-31",
            "status": "Active",
            "payment_status": "Paid",
            "notes": "Dedicated video integration"
        }
        res = client.post("/sponsorships", json=payload, headers=self.headers1)
        self.assertEqual(res.status_code, 201)
        sp_data = res.json()
        self.assertEqual(sp_data["brand_name"], "Acme Corp")
        self.assertEqual(sp_data["contract_value"], 5000.00)
        sp_id = sp_data["id"]

        # Verify automatic revenue sync for Paid sponsorship
        rev_res = client.get("/revenue", headers=self.headers1)
        self.assertEqual(rev_res.status_code, 200)
        revs = rev_res.json()
        self.assertTrue(any(r["amount"] == 5000.00 for r in revs))

        # Delete sponsorship
        del_res = client.delete(f"/sponsorships/{sp_id}", headers=self.headers1)
        self.assertEqual(del_res.status_code, 200)

    def test_revenue_analytics_endpoints(self):
        client.post("/revenue", json={
            "source": "Sponsorships",
            "amount": 3000.00,
            "date": "2026-08-05"
        }, headers=self.headers1)

        client.post("/revenue", json={
            "source": "Ad Revenue",
            "amount": 1500.00,
            "date": "2026-08-12"
        }, headers=self.headers1)

        # Test summary
        sum_res = client.get("/revenue/analytics/summary", headers=self.headers1)
        self.assertEqual(sum_res.status_code, 200)
        sum_data = sum_res.json()
        self.assertEqual(sum_data["total_revenue"], 4500.00)
        self.assertEqual(sum_data["total_sponsorship_revenue"], 3000.00)
        self.assertEqual(sum_data["total_ad_revenue"], 1500.00)

        # Test by-source
        src_res = client.get("/revenue/analytics/by-source", headers=self.headers1)
        self.assertEqual(src_res.status_code, 200)
        src_data = src_res.json()
        self.assertTrue(any(s["source"] == "Sponsorships" and s["amount"] == 3000.00 for s in src_data))

        # Test monthly
        monthly_res = client.get("/revenue/analytics/monthly", headers=self.headers1)
        self.assertEqual(monthly_res.status_code, 200)

        # Test trends
        trends_res = client.get("/revenue/analytics/trends?days=30", headers=self.headers1)
        self.assertEqual(trends_res.status_code, 200)
        self.assertEqual(len(trends_res.json()), 2)

    def test_multi_tenancy_access_control(self):
        # Creator 1 creates revenue & sponsorship
        r1 = client.post("/revenue", json={
            "source": "Sponsorships",
            "amount": 10000.00,
            "date": "2026-08-01"
        }, headers=self.headers1).json()

        s1 = client.post("/sponsorships", json={
            "brand_name": "Secret Sponsor",
            "campaign_name": "Confidential",
            "contract_value": 10000.00,
            "start_date": "2026-08-01"
        }, headers=self.headers1).json()

        # Creator 2 attempts to fetch Creator 1's records -> Should return 404
        get_r = client.get(f"/revenue/{r1['id']}", headers=self.headers2)
        self.assertEqual(get_r.status_code, 404)

        get_s = client.get(f"/sponsorships/{s1['id']}", headers=self.headers2)
        self.assertEqual(get_s.status_code, 404)

        # Creator 2 attempts to delete Creator 1's records -> Should return 404
        del_r = client.delete(f"/revenue/{r1['id']}", headers=self.headers2)
        self.assertEqual(del_r.status_code, 404)

        del_s = client.delete(f"/sponsorships/{s1['id']}", headers=self.headers2)
        self.assertEqual(del_s.status_code, 404)

        # Creator 2's list must be empty
        list_r = client.get("/revenue", headers=self.headers2).json()
        self.assertEqual(len(list_r), 0)

    def test_invalid_requests(self):
        # Negative amount
        invalid_rev = client.post("/revenue", json={
            "source": "Ad Revenue",
            "amount": -500.00,
            "date": "2026-08-01"
        }, headers=self.headers1)
        self.assertEqual(invalid_rev.status_code, 422)

        # Missing brand name in sponsorship
        invalid_sp = client.post("/sponsorships", json={
            "campaign_name": "No Brand",
            "contract_value": 1000.00,
            "start_date": "2026-08-01"
        }, headers=self.headers1)
        self.assertEqual(invalid_sp.status_code, 422)


if __name__ == "__main__":
    unittest.main()
