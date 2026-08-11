"""Content analytics and auth regression tests."""
from datetime import date

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.core.security import create_access_token, hash_password
from app.db.database import Base, get_db
from app.models.content import Content
from app.models.user import User
from app.services.content_service import calculate_engagement_rate
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


def _create_user(db_session, *, email: str, role: str = 'Creator', password: str = 'Password123!') -> User:
    user = User(
        full_name=f'{role} User',
        email=email,
        password_hash=hash_password(password),
        role=role,
        status='active',
    )
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)
    return user


def _auth_header(user: User) -> dict:
    token = create_access_token(subject=str(user.id), email=user.email, role=user.role)
    return {'Authorization': f'Bearer {token}'}


def _create_content(db_session, creator: User, title: str = 'Python Tutorial', **overrides) -> Content:
    payload = {
        'creator_id': creator.id,
        'content_id': f'{creator.id}-{title.lower().replace(" ", "-")}',
        'title': title,
        'platform': 'YouTube',
        'content_type': 'Video',
        'published_at': date(2026, 5, 1),
        'views': 50000,
        'likes': 4200,
        'comments': 380,
        'shares': 210,
        'saves': 640,
        'watch_time': 125000,
        'reach': 48000,
    }
    payload.update(overrides)
    payload['engagement_rate'] = calculate_engagement_rate(
        payload['likes'], payload['comments'], payload['shares'], payload['saves'], payload['reach']
    )
    content = Content(**payload)
    db_session.add(content)
    db_session.commit()
    db_session.refresh(content)
    return content


def test_engagement_rate_handles_zero_reach():
    assert calculate_engagement_rate(10, 5, 2, 1, 0) == 0.0
    assert calculate_engagement_rate(100, 50, 25, 25, 1000) == 20.0


def test_register_login_profile(client, db_session):
    register = client.post(
        '/auth/register',
        json={
            'full_name': 'Creator One',
            'email': 'creator1@example.com',
            'password': 'Password123!',
            'role': 'Creator',
            'accept_terms': True,
        },
    )
    assert register.status_code == 201

    login = client.post('/auth/login', json={'email': 'creator1@example.com', 'password': 'Password123!'})
    assert login.status_code == 200
    token = login.json()['access_token']

    profile = client.get('/auth/profile', headers={'Authorization': f'Bearer {token}'})
    assert profile.status_code == 200
    assert profile.json()['email'] == 'creator1@example.com'
    assert profile.json()['role'] == 'Creator'


def test_register_role_case_insensitive(client, db_session):
    response = client.post(
        '/auth/register',
        json={
            'full_name': 'Agency User',
            'email': 'agency@example.com',
            'password': 'Password123!',
            'role': 'agency',
            'accept_terms': True,
        },
    )
    assert response.status_code == 201
    assert response.json()['email'] == 'agency@example.com'
    assert response.json()['role'] == 'Agency'


def test_content_crud_and_analytics(client, db_session):
    creator = _create_user(db_session, email='creator@example.com', role='Creator')
    headers = _auth_header(creator)

    created = client.post(
        '/api/content',
        headers=headers,
        json={
            'title': 'Python Tutorial',
            'platform': 'YouTube',
            'content_type': 'Video',
            'published_at': '2026-05-01',
            'views': 50000,
            'likes': 4200,
            'comments': 380,
            'shares': 210,
            'saves': 640,
            'watch_time': 125000,
            'reach': 48000,
        },
    )
    assert created.status_code == 201
    body = created.json()
    assert body['engagement_rate'] == calculate_engagement_rate(4200, 380, 210, 640, 48000)
    content_id = body['id']

    listed = client.get('/api/content?page=1&page_size=10&sort_by=views&sort_order=desc', headers=headers)
    assert listed.status_code == 200
    assert listed.json()['total'] == 1
    assert listed.json()['items'][0]['title'] == 'Python Tutorial'

    detail = client.get(f'/api/content/{content_id}', headers=headers)
    assert detail.status_code == 200

    updated = client.put(
        f'/api/content/{content_id}',
        headers=headers,
        json={'likes': 5000, 'reach': 50000},
    )
    assert updated.status_code == 200
    assert updated.json()['engagement_rate'] == calculate_engagement_rate(5000, 380, 210, 640, 50000)

    summary = client.get('/api/content/analytics/summary', headers=headers)
    assert summary.status_code == 200
    assert summary.json()['total_views'] == 50000

    top = client.get('/api/content/analytics/top-performing', headers=headers)
    assert top.status_code == 200
    assert len(top.json()) == 1

    trends = client.get('/api/content/analytics/trends', headers=headers)
    assert trends.status_code == 200
    assert trends.json()[0]['date'] == '2026-05-01'

    compare = client.get('/api/content/compare', headers=headers, params=[('ids', content_id)])
    assert compare.status_code == 200
    assert compare.json()[0]['id'] == content_id

    deleted = client.delete(f'/api/content/{content_id}', headers=headers)
    assert deleted.status_code == 200


def test_creator_cannot_access_other_creator_content(client, db_session):
    owner = _create_user(db_session, email='owner@example.com')
    other = _create_user(db_session, email='other@example.com')
    content = _create_content(db_session, owner, title='Private Video')

    response = client.get(f'/api/content/{content.id}', headers=_auth_header(other))
    assert response.status_code == 404


def test_marketing_cannot_modify_content(client, db_session):
    creator = _create_user(db_session, email='creator2@example.com')
    marketing = _create_user(db_session, email='marketing@example.com', role='Marketing Team')
    content = _create_content(db_session, creator, title='Shared Analytics Item')

    response = client.put(
        f'/api/content/{content.id}',
        headers=_auth_header(marketing),
        json={'title': 'Hacked Title'},
    )
    assert response.status_code == 403


def test_admin_can_view_all_content(client, db_session):
    creator = _create_user(db_session, email='creator3@example.com')
    admin = _create_user(db_session, email='admin@example.com', role='Administrator')
    content = _create_content(db_session, creator, title='Admin Visible')

    response = client.get(f'/api/content/{content.id}', headers=_auth_header(admin))
    assert response.status_code == 200
    assert response.json()['title'] == 'Admin Visible'


def test_invalid_sort_rejected(client, db_session):
    creator = _create_user(db_session, email='creator4@example.com')
    response = client.get('/api/content?sort_by=password_hash', headers=_auth_header(creator))
    assert response.status_code == 400
