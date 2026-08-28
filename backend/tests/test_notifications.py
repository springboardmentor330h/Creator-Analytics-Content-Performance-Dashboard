import unittest
from datetime import date
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from backend.app.main import app
from backend.app.db.database import Base, get_db
from backend.app.models.user import User
from backend.app.models.notification import Notification
from backend.app.models.content import Content
from backend.app.models.revenue import Revenue
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


class TestNotificationSystem(unittest.TestCase):

    def setUp(self):
        app.dependency_overrides[get_db] = override_get_db
        Base.metadata.create_all(bind=engine)
        self.db = TestingSessionLocal()

        self.db.query(Notification).delete()
        self.db.query(Content).delete()
        self.db.query(Revenue).delete()
        self.db.query(User).delete()
        self.db.commit()

        self.creator1 = User(
            full_name="Creator Alpha",
            email="alpha@test.com",
            password="hashedpassword123",
            role="creator"
        )
        self.creator2 = User(
            full_name="Creator Beta",
            email="beta@test.com",
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
        self.db.rollback()
        self.db.query(Notification).delete()
        self.db.query(Content).delete()
        self.db.query(Revenue).delete()
        self.db.query(User).delete()
        self.db.commit()
        self.db.close()

    def test_create_and_get_notification(self):
        payload = {
            "title": "System Alert",
            "message": "Welcome to CreatorIQ Sprint 7!",
            "type": "system",
            "severity": "info"
        }
        res = client.post("/notifications", json=payload, headers=self.headers1)
        self.assertEqual(res.status_code, 201)
        data = res.json()
        self.assertEqual(data["title"], "System Alert")
        self.assertFalse(data["is_read"])
        self.assertEqual(data["creator_id"], self.creator1.id)

        # Get list
        list_res = client.get("/notifications", headers=self.headers1)
        self.assertEqual(list_res.status_code, 200)
        self.assertEqual(len(list_res.json()), 1)

    def test_unread_count_and_mark_read(self):
        client.post("/notifications", json={
            "title": "Notif 1", "message": "Test 1", "type": "performance", "severity": "info"
        }, headers=self.headers1)
        client.post("/notifications", json={
            "title": "Notif 2", "message": "Test 2", "type": "revenue", "severity": "success"
        }, headers=self.headers1)

        # Unread count
        cnt_res = client.get("/notifications/unread-count", headers=self.headers1)
        self.assertEqual(cnt_res.status_code, 200)
        self.assertEqual(cnt_res.json()["unread_count"], 2)

        # Mark first read
        notif_id = client.get("/notifications", headers=self.headers1).json()[0]["id"]
        read_res = client.put(f"/notifications/{notif_id}/read", headers=self.headers1)
        self.assertEqual(read_res.status_code, 200)
        self.assertTrue(read_res.json()["is_read"])

        # Check updated count
        cnt_res2 = client.get("/notifications/unread-count", headers=self.headers1)
        self.assertEqual(cnt_res2.json()["unread_count"], 1)

        # Mark all read
        all_res = client.put("/notifications/read-all", headers=self.headers1)
        self.assertEqual(all_res.status_code, 200)
        self.assertEqual(all_res.json()["updated_count"], 1)

    def test_trigger_alert_scan_engine(self):
        # Insert high performing content and revenue item for creator 1
        content = Content(
            creator_id=self.creator1.id,
            content_title="Viral Tech Video",
            platform="YouTube",
            views=15000,
            likes=1200,
            comments=300,
            shares=150,
            reach=10000
        )
        revenue = Revenue(
            creator_id=self.creator1.id,
            source="YouTube AdSense",
            amount=6500.0,
            date=date(2026, 8, 1)
        )
        self.db.add(content)
        self.db.add(revenue)
        self.db.commit()

        # Trigger alert check
        alert_res = client.post("/notifications/check-alerts", headers=self.headers1)
        self.assertEqual(alert_res.status_code, 200)
        alerts = alert_res.json()
        self.assertGreater(len(alerts), 0)
        titles = [a["title"] for a in alerts]
        self.assertTrue(any("Milestone" in t or "Target" in t or "Landmark" in t for t in titles))

    def test_multi_tenant_notification_isolation(self):
        # Creator 1 creates notification
        n1 = client.post("/notifications", json={
            "title": "Private Alert 1", "message": "Secret for Creator 1", "type": "system"
        }, headers=self.headers1).json()

        # Creator 2 gets notifications -> should be empty
        c2_list = client.get("/notifications", headers=self.headers2).json()
        self.assertEqual(len(c2_list), 0)

        # Creator 2 attempts to mark Creator 1's notification read -> Should return 404
        bad_read = client.put(f"/notifications/{n1['id']}/read", headers=self.headers2)
        self.assertEqual(bad_read.status_code, 404)

        # Creator 2 attempts to delete Creator 1's notification -> Should return 404
        bad_del = client.delete(f"/notifications/{n1['id']}", headers=self.headers2)
        self.assertEqual(bad_del.status_code, 404)


if __name__ == "__main__":
    unittest.main()
