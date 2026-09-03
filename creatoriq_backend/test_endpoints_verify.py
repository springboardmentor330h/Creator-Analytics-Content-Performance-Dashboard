import json
from fastapi.testclient import TestClient
from main import app
from app.core.security import create_access_token
from app.db.database import SessionLocal
from app.models.user import User
from sqlalchemy import select

def verify():
    s = SessionLocal()
    user = s.scalar(select(User).where(User.email == 'creator@creatoriq.dev'))
    s.close()

    token = create_access_token(str(user.id), user.email, user.role)
    client = TestClient(app)
    headers = {'Authorization': f'Bearer {token}'}

    print("==================================================")
    print("1. GET /analytics/summary (All Platforms)")
    r = client.get('/analytics/summary', headers=headers)
    print("Status:", r.status_code)
    print(json.dumps(r.json(), indent=2))

    print("\n==================================================")
    print("2. GET /analytics/summary?platform=Instagram")
    r = client.get('/analytics/summary?platform=Instagram', headers=headers)
    print("Status:", r.status_code)
    print(json.dumps(r.json(), indent=2))

    print("\n==================================================")
    print("3. GET /analytics/summary?platform=LinkedIn")
    r = client.get('/analytics/summary?platform=LinkedIn', headers=headers)
    print("Status:", r.status_code)
    print(json.dumps(r.json(), indent=2))

    print("\n==================================================")
    print("4. GET /analytics/platform-comparison")
    r = client.get('/analytics/platform-comparison', headers=headers)
    print("Status:", r.status_code)
    print(json.dumps(r.json(), indent=2))

    print("\n==================================================")
    print("5. GET /analytics/top-content?platform=Facebook")
    r = client.get('/analytics/top-content?platform=Facebook', headers=headers)
    print("Status:", r.status_code)
    print(json.dumps(r.json(), indent=2))

    print("\n==================================================")
    print("6. GET /analytics/platform-performance")
    r = client.get('/analytics/platform-performance', headers=headers)
    print("Status:", r.status_code)
    print(json.dumps(r.json(), indent=2))

    print("\n==================================================")
    print("7. GET /analytics/chart/engagement?platform=YouTube")
    r = client.get('/analytics/chart/engagement?platform=YouTube', headers=headers)
    print("Status:", r.status_code)
    print("Labels count:", len(r.json().get('labels', [])))
    print("Values count:", len(r.json().get('values', [])))

    print("\n==================================================")
    print("8. GET /analytics/chart/followers")
    r = client.get('/analytics/chart/followers', headers=headers)
    print("Status:", r.status_code)
    print("Labels count:", len(r.json().get('labels', [])))

    print("\n==================================================")
    print("9. GET /content")
    r = client.get('/content', headers=headers)
    print("Status:", r.status_code)
    print("Total items:", r.json().get('total'))

    print("\n==================================================")
    print("10. POST /content & Duplicate Prevention Test")
    payload = {
        "title": "Verified Multi-Platform Test Post",
        "platform": "Instagram",
        "external_content_id": "TEST_IG_999",
        "content_type": "Post",
        "published_at": "2026-08-15",
        "views": 10000,
        "likes": 800,
        "comments": 70,
        "shares": 30,
        "reach": 9500
    }
    r1 = client.post('/content', json=payload, headers=headers)
    created_id = r1.json().get('id')
    print("First POST /content: status =", r1.status_code, "ID =", created_id, "Views =", r1.json().get('views'))

    # Update views in payload with same external_content_id
    payload['views'] = 25000
    r2 = client.post('/content', json=payload, headers=headers)
    updated_id = r2.json().get('id')
    print("Duplicate POST /content: status =", r2.status_code, "ID =", updated_id, "Views =", r2.json().get('views'))

    assert created_id == updated_id, "Duplicate record was created instead of updating!"
    print("SUCCESS: Duplicate prevented and existing record updated!")

    print("\n==================================================")
    print("11. GET /content/{id}")
    r3 = client.get(f'/content/{created_id}', headers=headers)
    print("GET /content/{id}: status =", r3.status_code, "Title =", r3.json().get('title'), "Views =", r3.json().get('views'))

if __name__ == '__main__':
    verify()
