import unittest
from datetime import date
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from backend.app.main import app
from backend.app.db.database import Base, get_db
from backend.app.models.user import User
from backend.app.models.report import Report
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


class TestReportAndExportEngine(unittest.TestCase):

    def setUp(self):
        app.dependency_overrides[get_db] = override_get_db
        Base.metadata.create_all(bind=engine)
        self.db = TestingSessionLocal()

        self.db.query(Report).delete()
        self.db.query(Content).delete()
        self.db.query(Revenue).delete()
        self.db.query(User).delete()
        self.db.commit()

        self.creator1 = User(
            full_name="Creator Reporter",
            email="reporter@test.com",
            password="hashedpassword123",
            role="creator"
        )
        self.creator2 = User(
            full_name="Creator Rival",
            email="rival@test.com",
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
        self.db.query(Report).delete()
        self.db.query(Content).delete()
        self.db.query(Revenue).delete()
        self.db.query(User).delete()
        self.db.commit()
        self.db.close()

    def test_get_report_types(self):
        res = client.get("/reports/types", headers=self.headers1)
        self.assertEqual(res.status_code, 200)
        types = res.json()
        self.assertGreaterEqual(len(types), 5)
        keys = [t["key"] for t in types]
        self.assertIn("executive_summary", keys)
        self.assertIn("content_performance", keys)
        self.assertIn("revenue_analytics", keys)

    def test_generate_report_json(self):
        # Insert sample data
        content = Content(
            creator_id=self.creator1.id,
            content_title="Comprehensive Analysis",
            platform="YouTube",
            views=8000,
            likes=900,
            comments=200,
            shares=50,
            reach=5000
        )
        revenue = Revenue(
            creator_id=self.creator1.id,
            source="Sponsorships",
            amount=4000.0,
            date=date(2026, 8, 10)
        )
        self.db.add(content)
        self.db.add(revenue)
        self.db.commit()

        payload = {"report_type": "revenue_analytics", "date_range": "30_days"}
        res = client.post("/reports/generate?save=true", json=payload, headers=self.headers1)
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertEqual(data["report_type"], "revenue_analytics")
        self.assertIn("kpis", data)
        self.assertEqual(data["kpis"]["total_revenue"], 4000.0)
        self.assertIn("tables", data)

    def test_export_pdf_report(self):
        payload = {"report_type": "executive_summary", "date_range": "30_days"}
        res = client.post("/reports/export/pdf", json=payload, headers=self.headers1)
        self.assertEqual(res.status_code, 200)
        self.assertEqual(res.headers["content-type"], "application/pdf")
        self.assertGreater(len(res.content), 500)
        self.assertTrue(res.content.startswith(b"%PDF"))

    def test_export_excel_report(self):
        payload = {"report_type": "content_performance", "date_range": "30_days"}
        res = client.post("/reports/export/excel", json=payload, headers=self.headers1)
        self.assertEqual(res.status_code, 200)
        self.assertEqual(
            res.headers["content-type"],
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        )
        self.assertGreater(len(res.content), 500)

    def test_multi_tenant_report_isolation(self):
        # Creator 1 generates report
        payload = {"report_type": "executive_summary", "date_range": "30_days"}
        rep1 = client.post("/reports/generate?save=true", json=payload, headers=self.headers1).json()
        report_id = rep1["id"]

        # Creator 2 attempts to fetch Creator 1's report -> Should return 404
        get_rep = client.get(f"/reports/{report_id}", headers=self.headers2)
        self.assertEqual(get_rep.status_code, 404)

        # Creator 2 attempts to download PDF of Creator 1's report -> Should return 404
        get_pdf = client.get(f"/reports/{report_id}/pdf", headers=self.headers2)
        self.assertEqual(get_pdf.status_code, 404)

        # Creator 2 attempts to delete Creator 1's report -> Should return 404
        del_rep = client.delete(f"/reports/{report_id}", headers=self.headers2)
        self.assertEqual(del_rep.status_code, 404)

        # Creator 2's saved reports list must be empty
        list_rep = client.get("/reports", headers=self.headers2).json()
        self.assertEqual(len(list_rep), 0)


if __name__ == "__main__":
    unittest.main()
