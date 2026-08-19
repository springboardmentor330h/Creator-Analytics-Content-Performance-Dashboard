"""Comprehensive test suite for Sprint 4: Dashboard Analytics APIs and Social Media Workflow."""
from datetime import date, timedelta
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine, select
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.core.security import create_access_token, hash_password
from app.db.database import Base, get_db
from app.models.audience import Audience
from app.models.content import Content
from app.models.growth import Growth
from app.models.social_connection import SocialConnection
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


def _create_content(db_session, creator: User, title: str, platform: str, **overrides) -> Content:
    payload = {
        'creator_id': creator.id,
        'content_id': f'{creator.id}-{title.lower().replace(" ", "-")}',
        'title': title,
        'platform': platform,
        'content_type': 'Video' if platform == 'YouTube' else 'Post',
        'published_at': date(2026, 8, 1),
        'views': 10000,
        'likes': 1000,
        'comments': 100,
        'shares': 50,
        'saves': 50,
        'watch_time': 20000,
        'reach': 15000,
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


# ==========================================
# TASK 1: KPI SUMMARY TESTS
# ==========================================

def test_kpi_summary_empty(client, db_session):
    user = _create_user(db_session)
    headers = _auth_headers(user)

    res = client.get('/analytics/summary', headers=headers)
    assert res.status_code == 200
    data = res.json()
    assert data == {
        'total_views': 0,
        'total_likes': 0,
        'total_comments': 0,
        'total_shares': 0,
        'total_reach': 0,
        'total_followers': 0,
        'average_engagement_rate': 0.0,
    }


def test_kpi_summary_with_content_and_growth(client, db_session):
    user = _create_user(db_session)
    headers = _auth_headers(user)

    # Add 2 content items
    _create_content(
        db_session,
        user,
        title='Post 1',
        platform='YouTube',
        views=30000,
        likes=2000,
        comments=400,
        shares=300,
        saves=100,
        reach=40000,
    )
    _create_content(
        db_session,
        user,
        title='Post 2',
        platform='Instagram',
        views=20000,
        likes=2200,
        comments=450,
        shares=300,
        saves=150,
        reach=25000,
    )

    # Add growth records
    db_session.add(Growth(creator_id=user.id, date=date(2026, 8, 1), followers=10000, reach=15000, engagement_rate=5.0))
    db_session.add(Growth(creator_id=user.id, date=date(2026, 8, 2), followers=12000, reach=20000, engagement_rate=6.5))
    db_session.commit()

    res = client.get('/analytics/summary', headers=headers)
    assert res.status_code == 200
    data = res.json()
    assert data['total_views'] == 50000
    assert data['total_likes'] == 4200
    assert data['total_comments'] == 850
    assert data['total_shares'] == 600
    assert data['total_reach'] == 65000
    assert data['total_followers'] == 12000  # latest growth follower count
    # Post 1 eng: (2000+400+300+100)/40000 * 100 = 7.0
    # Post 2 eng: (2200+450+300+150)/25000 * 100 = 12.4
    # Avg: (7.0 + 12.4) / 2 = 9.7
    assert data['average_engagement_rate'] == 9.7


def test_kpi_summary_fallback_to_audience_followers(client, db_session):
    user = _create_user(db_session)
    headers = _auth_headers(user)

    # Add audience records without growth records
    db_session.add(Audience(
        creator_id=user.id,
        age_group='18-24',
        gender='Male',
        country='India',
        city='Mumbai',
        device_type='Mobile',
        active_hour=18,
        followers=7000,
        impressions=15000,
        reach=10000,
    ))
    db_session.add(Audience(
        creator_id=user.id,
        age_group='25-34',
        gender='Female',
        country='USA',
        city='NYC',
        device_type='Desktop',
        active_hour=14,
        followers=5000,
        impressions=10000,
        reach=8000,
    ))
    db_session.commit()

    res = client.get('/analytics/summary', headers=headers)
    assert res.status_code == 200
    data = res.json()
    assert data['total_followers'] == 12000


# ==========================================
# TASK 2: ENGAGEMENT CHART API TESTS
# ==========================================

def test_chart_engagement_chronological(client, db_session):
    user = _create_user(db_session)
    headers = _auth_headers(user)

    # Seed content out of order
    _create_content(db_session, user, title='Day 3', platform='YouTube', published_at=date(2026, 8, 3), likes=710, comments=0, shares=0, saves=0, reach=10000)
    _create_content(db_session, user, title='Day 1', platform='YouTube', published_at=date(2026, 8, 1), likes=520, comments=0, shares=0, saves=0, reach=10000)
    _create_content(db_session, user, title='Day 2', platform='YouTube', published_at=date(2026, 8, 2), likes=640, comments=0, shares=0, saves=0, reach=10000)

    res = client.get('/analytics/chart/engagement', headers=headers)
    assert res.status_code == 200
    data = res.json()
    assert data['labels'] == ['2026-08-01', '2026-08-02', '2026-08-03']
    assert data['values'] == [5.2, 6.4, 7.1]


# ==========================================
# TASK 3: FOLLOWER GROWTH CHART API TESTS
# ==========================================

def test_chart_followers_chronological(client, db_session):
    user = _create_user(db_session)
    headers = _auth_headers(user)

    # Seed growth records out of order
    db_session.add(Growth(creator_id=user.id, date=date(2026, 8, 3), followers=10800, reach=800, engagement_rate=7.0))
    db_session.add(Growth(creator_id=user.id, date=date(2026, 8, 1), followers=10000, reach=500, engagement_rate=5.0))
    db_session.add(Growth(creator_id=user.id, date=date(2026, 8, 2), followers=10300, reach=600, engagement_rate=6.0))
    db_session.commit()

    res = client.get('/analytics/chart/followers', headers=headers)
    assert res.status_code == 200
    data = res.json()
    assert data['labels'] == ['2026-08-01', '2026-08-02', '2026-08-03']
    assert data['values'] == [10000, 10300, 10800]


# ==========================================
# TASK 4: PLATFORM COMPARISON TESTS
# ==========================================

def test_platform_comparison(client, db_session):
    user = _create_user(db_session)
    headers = _auth_headers(user)

    # YouTube: views 30000, reach 40000, likes 2500, comments 400, shares 100, saves 0 -> eng_rate = (2500+400+100)/40000*100 = 7.5
    _create_content(
        db_session,
        user,
        title='YT Post',
        platform='YouTube',
        views=30000,
        reach=40000,
        likes=2500,
        comments=400,
        shares=100,
        saves=0,
    )
    # Instagram: views 18000, reach 20000, likes 1000, comments 200, shares 50, saves 50 -> eng_rate = (1000+200+50+50)/20000*100 = 6.5
    _create_content(
        db_session,
        user,
        title='IG Post',
        platform='Instagram',
        views=18000,
        reach=20000,
        likes=1000,
        comments=200,
        shares=50,
        saves=50,
    )

    res = client.get('/analytics/platform-comparison', headers=headers)
    assert res.status_code == 200
    data = res.json()
    assert 'YouTube' in data
    assert 'Instagram' in data
    assert data['YouTube'] == {
        'views': 30000,
        'reach': 40000,
        'engagement_rate': 7.5,
        'likes': 2500,
        'comments': 400,
    }
    assert data['Instagram'] == {
        'views': 18000,
        'reach': 20000,
        'engagement_rate': 6.5,
        'likes': 1000,
        'comments': 200,
    }


# ==========================================
# TASK 5-8: SOCIAL MEDIA WORKFLOW TESTS
# ==========================================

def test_connect_platform_success(client, db_session):
    user = _create_user(db_session)
    headers = _auth_headers(user)

    res = client.post(
        '/social/connect',
        json={'platform': 'YouTube', 'account_name': 'DemoCreator'},
        headers=headers,
    )
    assert res.status_code == 200
    assert res.json() == {'message': 'YouTube account connected successfully'}

    # Verify DB record
    conn = db_session.query(SocialConnection).filter(
        SocialConnection.user_id == user.id,
        SocialConnection.platform == 'YouTube',
    ).first()
    assert conn is not None
    assert conn.status == 'connected'
    assert conn.platform_username == 'DemoCreator'


def test_connect_unsupported_platform(client, db_session):
    user = _create_user(db_session)
    headers = _auth_headers(user)

    res = client.post(
        '/social/connect',
        json={'platform': 'UnknownPlatform', 'account_name': 'DemoCreator'},
        headers=headers,
    )
    assert res.status_code == 400
    assert 'Unsupported platform' in res.json()['detail']


def test_get_connected_platforms(client, db_session):
    user = _create_user(db_session)
    headers = _auth_headers(user)

    # Initially empty
    empty_res = client.get('/social/platforms', headers=headers)
    assert empty_res.status_code == 200
    assert empty_res.json() == {'platforms': []}

    # Connect YouTube and Instagram
    client.post('/social/connect', json={'platform': 'YouTube', 'account_name': 'DemoYT'}, headers=headers)
    client.post('/social/connect', json={'platform': 'Instagram', 'account_name': 'DemoIG'}, headers=headers)

    res = client.get('/social/platforms', headers=headers)
    assert res.status_code == 200
    platforms = res.json()['platforms']
    assert len(platforms) == 2
    assert 'YouTube' in platforms
    assert 'Instagram' in platforms


def test_sync_unconnected_platform_fails(client, db_session):
    user = _create_user(db_session)
    headers = _auth_headers(user)

    res = client.post('/social/sync', json={'platform': 'YouTube'}, headers=headers)
    assert res.status_code == 400
    assert 'Platform is not connected' in res.json()['detail']


def test_sync_connected_platform_workflow(client, db_session):
    user = _create_user(db_session)
    headers = _auth_headers(user)

    # 1. Connect YouTube
    connect_res = client.post('/social/connect', json={'platform': 'YouTube', 'account_name': 'DemoCreator'}, headers=headers)
    assert connect_res.status_code == 200

    # 2. Sync YouTube
    sync_res = client.post('/social/sync', json={'platform': 'YouTube'}, headers=headers)
    assert sync_res.status_code == 200
    sync_body = sync_res.json()
    assert sync_body['platform'] == 'YouTube'
    assert sync_body['records_synced'] == 3
    assert 'synchronized successfully' in sync_body['message']

    # 3. Verify PostgreSQL / Content table
    contents = db_session.scalars(select(Content).where(Content.creator_id == user.id)).all()
    assert len(contents) == 3
    for c in contents:
        assert c.platform == 'YouTube'
        assert c.creator_id == user.id
        assert c.views > 0
        assert c.reach > 0
        assert c.engagement_rate > 0

    # 4. Check GET /api/content returns synchronized items
    content_list_res = client.get('/api/content', headers=headers)
    assert content_list_res.status_code == 200
    assert content_list_res.json()['total'] == 3

    # 5. Check GET /analytics/summary reflects synchronized items
    summary_res = client.get('/analytics/summary', headers=headers)
    assert summary_res.status_code == 200
    sum_data = summary_res.json()
    assert sum_data['total_views'] == sum(c.views for c in contents)
    assert sum_data['total_likes'] == sum(c.likes for c in contents)
    assert sum_data['total_reach'] == sum(c.reach for c in contents)

    # 6. Check GET /analytics/platform-comparison reflects YouTube
    plat_res = client.get('/analytics/platform-comparison', headers=headers)
    assert plat_res.status_code == 200
    plat_data = plat_res.json()
    assert 'YouTube' in plat_data
    assert plat_data['YouTube']['views'] == sum(c.views for c in contents)


def test_multi_platform_sync_and_comparison(client, db_session):
    user = _create_user(db_session)
    headers = _auth_headers(user)

    # Connect & sync YouTube and LinkedIn
    client.post('/social/connect', json={'platform': 'YouTube', 'account_name': 'DemoYT'}, headers=headers)
    client.post('/social/sync', json={'platform': 'YouTube'}, headers=headers)

    client.post('/social/connect', json={'platform': 'LinkedIn', 'account_name': 'DemoLI'}, headers=headers)
    client.post('/social/sync', json={'platform': 'LinkedIn'}, headers=headers)

    plat_res = client.get('/analytics/platform-comparison', headers=headers)
    assert plat_res.status_code == 200
    plat_data = plat_res.json()
    assert 'YouTube' in plat_data
    assert 'LinkedIn' in plat_data


# ==========================================
# AUTHENTICATION & REGRESSION TESTS
# ==========================================

def test_unauthenticated_requests_blocked(client):
    assert client.get('/analytics/summary').status_code == 401
    assert client.get('/analytics/chart/engagement').status_code == 401
    assert client.get('/analytics/chart/followers').status_code == 401
    assert client.get('/analytics/platform-comparison').status_code == 401
    assert client.post('/social/connect', json={'platform': 'YouTube', 'account_name': 'Test'}).status_code == 401
    assert client.get('/social/platforms').status_code == 401
    assert client.post('/social/sync', json={'platform': 'YouTube'}).status_code == 401


def test_user_isolation(client, db_session):
    user1 = _create_user(db_session, email='user1@example.com')
    user2 = _create_user(db_session, email='user2@example.com')
    h1 = _auth_headers(user1)
    h2 = _auth_headers(user2)

    # User 1 connects & syncs YouTube
    client.post('/social/connect', json={'platform': 'YouTube', 'account_name': 'User1YT'}, headers=h1)
    client.post('/social/sync', json={'platform': 'YouTube'}, headers=h1)

    # User 2 should have 0 connected platforms and 0 summary stats
    u2_platforms = client.get('/social/platforms', headers=h2).json()
    assert u2_platforms['platforms'] == []

    u2_summary = client.get('/analytics/summary', headers=h2).json()
    assert u2_summary['total_views'] == 0
    assert u2_summary['total_likes'] == 0


def test_validation_errors_422(client, db_session):
    user = _create_user(db_session)
    headers = _auth_headers(user)

    # Missing fields
    res1 = client.post('/social/connect', json={}, headers=headers)
    assert res1.status_code == 422

    res2 = client.post('/social/sync', json={}, headers=headers)
    assert res2.status_code == 422


def test_empty_account_name_400(client, db_session):
    user = _create_user(db_session)
    headers = _auth_headers(user)

    res = client.post('/social/connect', json={'platform': 'YouTube', 'account_name': '   '}, headers=headers)
    assert res.status_code == 400
    assert 'Account name is required' in res.json()['detail']


def test_case_insensitive_platform_support(client, db_session):
    user = _create_user(db_session)
    headers = _auth_headers(user)

    # lowercase 'youtube'
    res = client.post('/social/connect', json={'platform': 'youtube', 'account_name': 'my_yt'}, headers=headers)
    assert res.status_code == 200

    platforms_res = client.get('/social/platforms', headers=headers)
    assert 'YouTube' in platforms_res.json()['platforms']

    # sync with 'youtube'
    sync_res = client.post('/social/sync', json={'platform': 'youtube'}, headers=headers)
    assert sync_res.status_code == 200
    assert sync_res.json()['platform'] == 'YouTube'


def test_all_supported_platforms_sync(client, db_session):
    user = _create_user(db_session)
    headers = _auth_headers(user)

    all_platforms = ['YouTube', 'Instagram', 'Facebook', 'LinkedIn', 'TikTok', 'X']
    for p in all_platforms:
        conn = client.post('/social/connect', json={'platform': p, 'account_name': f'Creator_{p}'}, headers=headers)
        assert conn.status_code == 200
        sync = client.post('/social/sync', json={'platform': p}, headers=headers)
        assert sync.status_code == 200
        assert sync.json()['platform'] == p
        assert sync.json()['records_synced'] >= 2

    # Verify platform comparison has all 6
    comp_res = client.get('/analytics/platform-comparison', headers=headers)
    assert comp_res.status_code == 200
    comp_data = comp_res.json()
    for p in all_platforms:
        assert p in comp_data
        assert comp_data[p]['views'] > 0
        assert comp_data[p]['reach'] > 0
        assert comp_data[p]['likes'] > 0
        assert comp_data[p]['comments'] > 0
        assert isinstance(comp_data[p]['engagement_rate'], float)


def test_zero_reach_handling_in_comparison(client, db_session):
    user = _create_user(db_session)
    headers = _auth_headers(user)

    _create_content(db_session, user, title='Zero Reach Post', platform='Facebook', reach=0, likes=10, comments=5, shares=2, saves=1)

    comp_res = client.get('/analytics/platform-comparison', headers=headers)
    assert comp_res.status_code == 200
    data = comp_res.json()
    assert 'Facebook' in data
    assert data['Facebook']['reach'] == 0
    assert data['Facebook']['engagement_rate'] == 0.0

