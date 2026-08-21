"""Comprehensive automated test suite for Sprint 6: Revenue Analytics & Sponsorship Tracking.

Covers:
1. Revenue CRUD and input validation.
2. Sponsorship CRUD and date/status validations.
3. Revenue analytics (summary, breakdown by source, monthly, trend).
4. Sponsorship analytics (summary, status counts).
5. Strict creator data isolation between different accounts.
"""
from datetime import date
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine, select
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.core.security import create_access_token, hash_password
from app.db.database import Base, get_db
from app.models.revenue import Revenue
from app.models.sponsorship import Sponsorship
from app.models.user import User
from main import app

SQLALCHEMY_DATABASE_URL = "sqlite://"
engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


@pytest.fixture()
def db_session():
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    session = TestingSessionLocal()
    try:
        yield session
    finally:
        session.close()
        Base.metadata.drop_all(bind=engine)


@pytest.fixture()
def client(db_session):
    def override_get_db():
        try:
            yield db_session
        finally:
            pass

    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()


def _create_user(db_session, *, email: str = "creator@example.com", role: str = "Creator") -> User:
    user = User(
        full_name="Creator User",
        email=email,
        password_hash=hash_password("Password123!"),
        role=role,
        status="active",
    )
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)
    return user


def _auth_headers(user: User) -> dict:
    token = create_access_token(subject=str(user.id), email=user.email, role=user.role)
    return {"Authorization": f"Bearer {token}"}


# =========================================================
# 1. REVENUE CRUD & VALIDATION TESTS
# =========================================================

def test_create_revenue_success(client, db_session):
    user = _create_user(db_session)
    headers = _auth_headers(user)

    payload = {
        "source": "Sponsorship",
        "amount": 50000.0,
        "currency": "INR",
        "description": "Instagram brand campaign",
        "revenue_date": "2026-08-01",
    }
    res = client.post("/revenue", json=payload, headers=headers)
    assert res.status_code == 201
    data = res.json()
    assert data["id"] is not None
    assert data["creator_id"] == user.id
    assert data["source"] == "Sponsorship"
    assert data["amount"] == 50000.0
    assert data["currency"] == "INR"
    assert data["revenue_date"] == "2026-08-01"


def test_create_revenue_validation_errors(client, db_session):
    user = _create_user(db_session)
    headers = _auth_headers(user)

    # Negative amount
    res = client.post(
        "/revenue",
        json={"source": "Ad Revenue", "amount": -100.0, "currency": "INR", "revenue_date": "2026-08-01"},
        headers=headers,
    )
    assert res.status_code in (400, 422)

    # Invalid source
    res = client.post(
        "/revenue",
        json={"source": "Invalid Source", "amount": 1000.0, "currency": "INR", "revenue_date": "2026-08-01"},
        headers=headers,
    )
    assert res.status_code in (400, 422)


def test_revenue_crud_lifecycle(client, db_session):
    user = _create_user(db_session)
    headers = _auth_headers(user)

    # 1. Create
    res = client.post(
        "/revenue",
        json={"source": "Ad Revenue", "amount": 12000.0, "currency": "INR", "revenue_date": "2026-08-05"},
        headers=headers,
    )
    assert res.status_code == 201
    rev_id = res.json()["id"]

    # 2. Get list
    res_list = client.get("/revenue", headers=headers)
    assert res_list.status_code == 200
    assert len(res_list.json()) == 1

    # 3. Get single
    res_single = client.get(f"/revenue/{rev_id}", headers=headers)
    assert res_single.status_code == 200
    assert res_single.json()["amount"] == 12000.0

    # 4. Update
    res_update = client.put(
        f"/revenue/{rev_id}",
        json={"amount": 15000.0, "description": "Updated YouTube ad revenue"},
        headers=headers,
    )
    assert res_update.status_code == 200
    assert res_update.json()["amount"] == 15000.0
    assert res_update.json()["description"] == "Updated YouTube ad revenue"

    # 5. Delete
    res_del = client.delete(f"/revenue/{rev_id}", headers=headers)
    assert res_del.status_code == 200

    # 6. Verify deleted
    res_get_again = client.get(f"/revenue/{rev_id}", headers=headers)
    assert res_get_again.status_code == 404


# =========================================================
# 2. REVENUE ANALYTICS TESTS
# =========================================================

def test_revenue_analytics_endpoints(client, db_session):
    user = _create_user(db_session)
    headers = _auth_headers(user)

    # Seed multiple revenue records
    records = [
        {"source": "Sponsorship", "amount": 50000.0, "revenue_date": "2026-01-10"},
        {"source": "Ad Revenue", "amount": 12000.0, "revenue_date": "2026-01-25"},
        {"source": "Affiliate Marketing", "amount": 8500.0, "revenue_date": "2026-02-05"},
        {"source": "Brand Collaboration", "amount": 30000.0, "revenue_date": "2026-02-15"},
        {"source": "Subscription Revenue", "amount": 15000.0, "revenue_date": "2026-03-01"},
    ]
    for r in records:
        client.post("/revenue", json={**r, "currency": "INR"}, headers=headers)

    # 1. Summary
    res_summary = client.get("/analytics/revenue/summary", headers=headers)
    assert res_summary.status_code == 200
    summary_data = res_summary.json()
    assert summary_data["total_revenue"] == 115500.0
    assert summary_data["currency"] == "INR"

    # 2. By Source
    res_source = client.get("/analytics/revenue/by-source", headers=headers)
    assert res_source.status_code == 200
    source_data = res_source.json()
    assert source_data["Sponsorship"] == 50000.0
    assert source_data["Ad Revenue"] == 12000.0
    assert source_data["Affiliate Marketing"] == 8500.0
    assert source_data["Brand Collaboration"] == 30000.0
    assert source_data["Subscription Revenue"] == 15000.0

    # 3. Monthly
    res_monthly = client.get("/analytics/revenue/monthly", headers=headers)
    assert res_monthly.status_code == 200
    monthly_data = res_monthly.json()
    assert len(monthly_data) == 3
    assert monthly_data[0]["month"] == "2026-01"
    assert monthly_data[0]["revenue"] == 62000.0
    assert monthly_data[1]["month"] == "2026-02"
    assert monthly_data[1]["revenue"] == 38500.0
    assert monthly_data[2]["month"] == "2026-03"
    assert monthly_data[2]["revenue"] == 15000.0

    # 4. Trend
    res_trend = client.get("/analytics/revenue/trend", headers=headers)
    assert res_trend.status_code == 200
    trend_data = res_trend.json()
    assert trend_data["labels"] == ["2026-01", "2026-02", "2026-03"]
    assert trend_data["values"] == [62000.0, 38500.0, 15000.0]


# =========================================================
# 3. SPONSORSHIP CRUD & VALIDATION TESTS
# =========================================================

def test_create_sponsorship_success(client, db_session):
    user = _create_user(db_session)
    headers = _auth_headers(user)

    payload = {
        "brand_name": "TechBrand",
        "campaign_name": "Python Tutorial Campaign",
        "contract_value": 75000.0,
        "currency": "INR",
        "start_date": "2026-08-01",
        "end_date": "2026-08-31",
        "status": "Active",
        "payment_status": "Pending",
        "description": "Featured video integration",
    }
    res = client.post("/sponsorships", json=payload, headers=headers)
    assert res.status_code == 201
    data = res.json()
    assert data["id"] is not None
    assert data["creator_id"] == user.id
    assert data["brand_name"] == "TechBrand"
    assert data["campaign_name"] == "Python Tutorial Campaign"
    assert data["contract_value"] == 75000.0
    assert data["status"] == "Active"
    assert data["payment_status"] == "Pending"


def test_create_sponsorship_date_validation_error(client, db_session):
    user = _create_user(db_session)
    headers = _auth_headers(user)

    # end_date before start_date
    payload = {
        "brand_name": "Brand X",
        "campaign_name": "Invalid Dates",
        "contract_value": 5000.0,
        "start_date": "2026-08-31",
        "end_date": "2026-08-01",
        "status": "Draft",
        "payment_status": "Pending",
    }
    res = client.post("/sponsorships", json=payload, headers=headers)
    assert res.status_code in (400, 422)


def test_sponsorship_crud_lifecycle(client, db_session):
    user = _create_user(db_session)
    headers = _auth_headers(user)

    # 1. Create
    res = client.post(
        "/sponsorships",
        json={
            "brand_name": "SponsorCo",
            "campaign_name": "Autumn Launch",
            "contract_value": 45000.0,
            "start_date": "2026-09-01",
            "end_date": "2026-09-30",
            "status": "Draft",
            "payment_status": "Pending",
        },
        headers=headers,
    )
    assert res.status_code == 201
    spon_id = res.json()["id"]

    # 2. Get list
    res_list = client.get("/sponsorships", headers=headers)
    assert res_list.status_code == 200
    assert len(res_list.json()) == 1

    # 3. Get single
    res_single = client.get(f"/sponsorships/{spon_id}", headers=headers)
    assert res_single.status_code == 200
    assert res_single.json()["brand_name"] == "SponsorCo"

    # 4. Update
    res_up = client.put(
        f"/sponsorships/{spon_id}",
        json={"status": "Active", "payment_status": "Paid", "contract_value": 50000.0},
        headers=headers,
    )
    assert res_up.status_code == 200
    assert res_up.json()["status"] == "Active"
    assert res_up.json()["payment_status"] == "Paid"
    assert res_up.json()["contract_value"] == 50000.0

    # 5. Delete
    res_del = client.delete(f"/sponsorships/{spon_id}", headers=headers)
    assert res_del.status_code == 200

    # 6. Verify deleted
    res_get_again = client.get(f"/sponsorships/{spon_id}", headers=headers)
    assert res_get_again.status_code == 404


# =========================================================
# 4. SPONSORSHIP ANALYTICS TESTS
# =========================================================

def test_sponsorship_analytics_endpoints(client, db_session):
    user = _create_user(db_session)
    headers = _auth_headers(user)

    deals = [
        {"brand_name": "Brand A", "campaign_name": "C1", "contract_value": 50000.0, "status": "Active", "payment_status": "Pending"},
        {"brand_name": "Brand B", "campaign_name": "C2", "contract_value": 30000.0, "status": "Active", "payment_status": "Paid"},
        {"brand_name": "Brand C", "campaign_name": "C3", "contract_value": 70000.0, "status": "Completed", "payment_status": "Paid"},
        {"brand_name": "Brand D", "campaign_name": "C4", "contract_value": 20000.0, "status": "Draft", "payment_status": "Pending"},
    ]
    for d in deals:
        client.post(
            "/sponsorships",
            json={**d, "start_date": "2026-08-01", "end_date": "2026-08-31", "currency": "INR"},
            headers=headers,
        )

    # 1. Summary
    res_sum = client.get("/analytics/sponsorships/summary", headers=headers)
    assert res_sum.status_code == 200
    sum_data = res_sum.json()
    assert sum_data["total_sponsorships"] == 4
    assert sum_data["total_contract_value"] == 170000.0
    assert sum_data["active_sponsorships"] == 2
    assert sum_data["completed_sponsorships"] == 1
    assert sum_data["pending_payments"] == 2

    # 2. Status Breakdown
    res_stat = client.get("/analytics/sponsorships/status", headers=headers)
    assert res_stat.status_code == 200
    stat_data = res_stat.json()
    assert stat_data["Draft"] == 1
    assert stat_data["Active"] == 2
    assert stat_data["Completed"] == 1
    assert stat_data["Cancelled"] == 0


# =========================================================
# 5. CREATOR DATA ISOLATION TESTS
# =========================================================

def test_strict_creator_data_isolation(client, db_session):
    user_a = _create_user(db_session, email="creator_a@example.com")
    user_b = _create_user(db_session, email="creator_b@example.com")

    headers_a = _auth_headers(user_a)
    headers_b = _auth_headers(user_b)

    # Creator A creates revenue and sponsorship
    rev_a = client.post(
        "/revenue",
        json={"source": "Sponsorship", "amount": 80000.0, "currency": "INR", "revenue_date": "2026-08-01"},
        headers=headers_a,
    ).json()

    spon_a = client.post(
        "/sponsorships",
        json={
            "brand_name": "Exclusive Brand",
            "campaign_name": "Secret Deal",
            "contract_value": 100000.0,
            "start_date": "2026-08-01",
            "end_date": "2026-08-31",
            "status": "Active",
            "payment_status": "Pending",
        },
        headers=headers_a,
    ).json()

    # Creator B should NOT be able to view, modify, or delete Creator A's revenue
    res_rev_get = client.get(f"/revenue/{rev_a['id']}", headers=headers_b)
    assert res_rev_get.status_code == 404

    res_rev_put = client.put(f"/revenue/{rev_a['id']}", json={"amount": 0.0}, headers=headers_b)
    assert res_rev_put.status_code == 404

    res_rev_del = client.delete(f"/revenue/{rev_a['id']}", headers=headers_b)
    assert res_rev_del.status_code == 404

    # Creator B should NOT be able to view, modify, or delete Creator A's sponsorship
    res_spon_get = client.get(f"/sponsorships/{spon_a['id']}", headers=headers_b)
    assert res_spon_get.status_code == 404

    res_spon_put = client.put(f"/sponsorships/{spon_a['id']}", json={"contract_value": 0.0}, headers=headers_b)
    assert res_spon_put.status_code == 404

    res_spon_del = client.delete(f"/sponsorships/{spon_a['id']}", headers=headers_b)
    assert res_spon_del.status_code == 404

    # Creator B's analytics must NOT include Creator A's data
    res_b_rev_sum = client.get("/analytics/revenue/summary", headers=headers_b)
    assert res_b_rev_sum.status_code == 200
    assert res_b_rev_sum.json()["total_revenue"] == 0.0

    res_b_spon_sum = client.get("/analytics/sponsorships/summary", headers=headers_b)
    assert res_b_spon_sum.status_code == 200
    assert res_b_spon_sum.json()["total_sponsorships"] == 0
    assert res_b_spon_sum.json()["total_contract_value"] == 0.0
