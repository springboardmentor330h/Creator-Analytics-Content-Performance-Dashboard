from datetime import date, timedelta
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.core.security import create_access_token, hash_password
from app.db.database import Base, get_db
from app.models.audience import Audience
from app.models.growth import Growth
from app.models.user import User
from main import app

SQLALCHEMY_DATABASE_URL = 'sqlite://'
engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={'check_same_thread': False},
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


def _create_user(db_session, *, email: str = 'creator@example.com', role: str = 'Creator') -> User:
    user = User(
        full_name='Test Creator',
        email=email,
        password_hash=hash_password('Password123!'),
        role=role,
        status='active',
    )
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)
    return user


def _auth_headers(user: User) -> dict:
    token = create_access_token(subject=str(user.id), email=user.email, role=user.role)
    return {'Authorization': f'Bearer {token}'}


def test_create_and_get_audience(client, db_session):
    user = _create_user(db_session)
    headers = _auth_headers(user)

    payload = {
        'age_group': '18-24',
        'gender': 'Male',
        'country': 'India',
        'city': 'Hyderabad',
        'device_type': 'Mobile',
        'active_hour': 20,
        'followers': 25000,
        'impressions': 80000,
        'reach': 50000,
    }

    response = client.post('/audience', json=payload, headers=headers)
    assert response.status_code == 201
    data = response.json()
    assert data['id'] > 0
    assert data['creator_id'] == user.id
    assert data['age_group'] == '18-24'
    assert data['followers'] == 25000

    # Get all audience
    response_list = client.get('/audience', headers=headers)
    assert response_list.status_code == 200
    records = response_list.json()
    assert len(records) == 1
    assert records[0]['id'] == data['id']

    # Get single audience
    response_single = client.get(f"/audience/{data['id']}", headers=headers)
    assert response_single.status_code == 200
    assert response_single.json()['city'] == 'Hyderabad'


def test_update_and_delete_audience(client, db_session):
    user = _create_user(db_session)
    headers = _auth_headers(user)

    payload = {
        'age_group': '25-34',
        'gender': 'Female',
        'country': 'USA',
        'city': 'New York',
        'device_type': 'Desktop',
        'active_hour': 14,
        'followers': 10000,
        'impressions': 30000,
        'reach': 20000,
    }
    create_res = client.post('/audience', json=payload, headers=headers)
    aud_id = create_res.json()['id']

    # Partial update
    update_res = client.put(f'/audience/{aud_id}', json={'followers': 15000, 'city': 'Los Angeles'}, headers=headers)
    assert update_res.status_code == 200
    assert update_res.json()['followers'] == 15000
    assert update_res.json()['city'] == 'Los Angeles'

    # Delete
    del_res = client.delete(f'/audience/{aud_id}', headers=headers)
    assert del_res.status_code == 200
    assert del_res.json()['success'] is True

    # Get 404
    get_404 = client.get(f'/audience/{aud_id}', headers=headers)
    assert get_404.status_code == 404


def test_audience_validation(client, db_session):
    user = _create_user(db_session)
    headers = _auth_headers(user)

    # Invalid active_hour (>23)
    invalid_payload = {
        'age_group': '18-24',
        'gender': 'Male',
        'country': 'India',
        'city': 'Hyderabad',
        'device_type': 'Mobile',
        'active_hour': 25,
        'followers': 10,
        'impressions': 10,
        'reach': 10,
    }
    res = client.post('/audience', json=invalid_payload, headers=headers)
    assert res.status_code == 422

    # Negative followers
    invalid_payload['active_hour'] = 12
    invalid_payload['followers'] = -5
    res = client.post('/audience', json=invalid_payload, headers=headers)
    assert res.status_code == 422


def test_audience_analytics(client, db_session):
    user = _create_user(db_session)
    headers = _auth_headers(user)

    # Empty analytics
    empty_res = client.get('/analytics/audience', headers=headers)
    assert empty_res.status_code == 200
    assert empty_res.json()['total_followers'] == 0
    assert empty_res.json()['gender_distribution'] == {}

    # Seed multiple records
    records = [
        {'age_group': '18-24', 'gender': 'Male', 'country': 'India', 'city': 'Hyderabad', 'device_type': 'Mobile', 'active_hour': 20, 'followers': 6000, 'impressions': 12000, 'reach': 10000},
        {'age_group': '25-34', 'gender': 'Female', 'country': 'USA', 'city': 'New York', 'device_type': 'Desktop', 'active_hour': 14, 'followers': 4000, 'impressions': 8000, 'reach': 5000},
    ]
    for r in records:
        client.post('/audience', json=r, headers=headers)

    analytics_res = client.get('/analytics/audience', headers=headers)
    assert analytics_res.status_code == 200
    data = analytics_res.json()
    assert data['total_followers'] == 10000
    assert data['total_reach'] == 15000
    assert data['total_impressions'] == 20000
    assert data['gender_distribution'] == {'Male': 60.0, 'Female': 40.0}
    assert data['age_distribution'] == {'18-24': 60.0, '25-34': 40.0}
    assert data['top_countries'] == ['India', 'USA']
    assert data['top_cities'] == ['Hyderabad', 'New York']
    assert data['device_distribution'] == {'Mobile': 60.0, 'Desktop': 40.0}


def test_growth_and_trends_analytics(client, db_session):
    user = _create_user(db_session)
    headers = _auth_headers(user)

    base_date = date(2026, 8, 1)
    growth_data = [
        {'date': str(base_date), 'followers': 1000, 'reach': 500, 'engagement_rate': 5.0},
        {'date': str(base_date + timedelta(days=1)), 'followers': 1200, 'reach': 600, 'engagement_rate': 6.0},
        {'date': str(base_date + timedelta(days=2)), 'followers': 1500, 'reach': 800, 'engagement_rate': 7.0},
    ]
    for g in growth_data:
        res = client.post('/growth', json=g, headers=headers)
        assert res.status_code == 201

    # Test GET /analytics/growth
    growth_res = client.get('/analytics/growth', headers=headers)
    assert growth_res.status_code == 200
    points = growth_res.json()
    assert len(points) == 3
    # First item
    assert points[0]['date'] == '2026-08-01'
    assert points[0]['followers'] == 1000
    assert points[0]['daily_growth'] == 0
    assert points[0]['growth_percentage'] == 0.0
    # Second item (1200 - 1000 = 200, (200/1000)*100 = 20.0%)
    assert points[1]['date'] == '2026-08-02'
    assert points[1]['followers'] == 1200
    assert points[1]['daily_growth'] == 200
    assert points[1]['growth_percentage'] == 20.0

    # Test GET /analytics/audience-trends
    trends_res = client.get('/analytics/audience-trends', headers=headers)
    assert trends_res.status_code == 200
    trend_points = trends_res.json()
    assert len(trend_points) == 3
    assert trend_points[0] == {'date': '2026-08-01', 'followers': 1000, 'reach': 500}
    assert trend_points[2] == {'date': '2026-08-03', 'followers': 1500, 'reach': 800}
