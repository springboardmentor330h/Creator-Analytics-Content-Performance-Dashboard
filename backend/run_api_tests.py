"""
CreatorIQ Automated API Test Runner
------------------------------------
Hits every real endpoint in your API and records the ACTUAL status code
and response body it gets back. No results are invented — whatever your
server returns is what gets written to results.csv.

HOW TO RUN:
1. Make sure your FastAPI server is running (uvicorn main:app --reload)
2. Put this file in any folder on your machine
3. Install requests if you don't have it:  pip install requests
4. Run:  python run_api_tests.py
5. It creates results.csv in the same folder — send that file back to Claude
"""

import requests
import csv
import json
from datetime import date

BASE_URL = "http://127.0.0.1:8000"
EMAIL = "sakshi@example.com"
PASSWORD = "Sakshi@123"

results = []


def record(test_id, module, scenario, method, path, resp=None, error=None):
    if error:
        actual = f"Request failed: {error}"
        status_code = "N/A"
    else:
        status_code = resp.status_code
        try:
            body = resp.json()
            body_str = json.dumps(body)[:300]
        except Exception:
            body_str = resp.text[:300]
        actual = f"{method} {path} returned {status_code}. Response: {body_str}"
    results.append({
        "Test Case ID": test_id,
        "Module": module,
        "Test Scenario": scenario,
        "HTTP": f"{method} {path}",
        "Status Code": status_code,
        "Actual Result": actual,
    })
    print(f"[{status_code}] {test_id}: {method} {path}")


def safe_call(method, path, test_id, module, scenario, **kwargs):
    try:
        resp = requests.request(method, f"{BASE_URL}{path}", timeout=10, **kwargs)
        record(test_id, module, scenario, method, path, resp=resp)
        return resp
    except Exception as e:
        record(test_id, module, scenario, method, path, error=str(e))
        return None


# ---------------------------------------------------------------
# 1. AUTH: register (may already exist -> that's a real result too)
# ---------------------------------------------------------------
safe_call("POST", "/auth/register", "AUTO-AUTH-REG", "Authentication",
          "Register with test account (may already exist)",
          json={"full_name": "Sakshi Test", "email": EMAIL, "password": PASSWORD})

# 2. AUTH: login with valid credentials -> capture token
login_resp = safe_call("POST", "/auth/login", "AUTO-AUTH-LOGIN", "Authentication",
                        "Login with valid credentials",
                        json={"email": EMAIL, "password": PASSWORD})

token = None
if login_resp is not None and login_resp.status_code == 200:
    try:
        token = login_resp.json().get("access_token")
    except Exception:
        pass

headers = {"Authorization": f"Bearer {token}"} if token else {}

if not token:
    print("\n*** WARNING: could not obtain a token. Protected-route tests below will show real 401s. ***\n")

# 3. AUTH: login with wrong password
safe_call("POST", "/auth/login", "AUTO-AUTH-BADPW", "Authentication",
          "Login with incorrect password",
          json={"email": EMAIL, "password": "WrongPassword123"})

# 4. AUTH: login with non-existing email
safe_call("POST", "/auth/login", "AUTO-AUTH-NOEMAIL", "Authentication",
          "Login with non-existing email",
          json={"email": "doesnotexist@example.com", "password": "whatever123"})

# 5. AUTH: /auth/token (Swagger OAuth2 form login)
safe_call("POST", "/auth/token", "AUTO-AUTH-SWAGGERTOKEN", "Authentication",
          "Login via OAuth2 form (auth/token)",
          data={"username": EMAIL, "password": PASSWORD})

# 6. /users/me without token
safe_call("GET", "/users/me", "AUTO-AUTH-NOTOKEN", "Authentication",
          "Access protected API without token")

# 7. /users/me with invalid token
safe_call("GET", "/users/me", "AUTO-AUTH-BADTOKEN", "Authentication",
          "Access protected API with invalid token",
          headers={"Authorization": "Bearer invalid.token.value"})

# 8. /users/me with valid token
safe_call("GET", "/users/me", "AUTO-AUTH-VALIDTOKEN", "Authentication",
          "Access protected API with valid token", headers=headers)

# ---------------------------------------------------------------
# ROLES / USERS / DASHBOARD
# ---------------------------------------------------------------
safe_call("GET", "/roles/", "AUTO-ROLES-LIST", "Roles", "List available roles", headers=headers)
safe_call("GET", "/dashboard/overview", "AUTO-DASH-OVERVIEW", "Dashboard", "Dashboard overview", headers=headers)
safe_call("GET", "/users", "AUTO-USERS-LIST", "Profile", "Get all users", headers=headers)
safe_call("GET", "/users/1", "AUTO-USERS-GET1", "Profile", "Get user by ID (1)", headers=headers)

new_user_resp = safe_call("POST", "/users", "AUTO-USERS-CREATE", "Profile",
                           "Create a new user",
                           json={"full_name": "Auto Test User", "email": "autotest@example.com", "role": "creator"},
                           headers=headers)

# ---------------------------------------------------------------
# AUDIENCE
# ---------------------------------------------------------------
safe_call("GET", "/audience", "AUTO-AUD-LIST", "Audience Analytics", "Get all audience records", headers=headers)

aud_create = safe_call("POST", "/audience", "AUTO-AUD-CREATE", "Audience Analytics",
                        "Create audience record",
                        json={"creator_id": 1, "age_group": "18-24", "gender": "female",
                              "country": "India", "city": "Bengaluru", "device_type": "mobile",
                              "active_hour": 20, "followers": 1000, "impressions": 5000, "reach": 3000},
                        headers=headers)

safe_call("GET", "/audience/1", "AUTO-AUD-GET1", "Audience Analytics", "Get audience by ID (1)", headers=headers)
safe_call("GET", "/analytics/audience", "AUTO-AUD-REPORT", "Audience Analytics", "Audience analytics report", headers=headers)
safe_call("GET", "/analytics/growth", "AUTO-AUD-GROWTH", "Growth & Trends", "Growth analytics report", headers=headers)
safe_call("GET", "/analytics/audience-trends", "AUTO-AUD-TRENDS", "Growth & Trends", "Audience trends", headers=headers)

# ---------------------------------------------------------------
# CONTENT
# ---------------------------------------------------------------
safe_call("GET", "/content", "AUTO-CONTENT-LIST", "Content Analytics", "Get all content", headers=headers)

content_create = safe_call("POST", "/content", "AUTO-CONTENT-CREATE", "Content Analytics",
                            "Create content record",
                            json={"creator_id": 1, "platform": "YouTube", "content_title": "Auto Test Video",
                                  "views": 1000, "likes": 100, "comments": 10, "shares": 5, "saves": 2,
                                  "watch_time": 120.5, "reach": 800, "published_date": str(date.today())},
                            headers=headers)

safe_call("GET", "/content/1", "AUTO-CONTENT-GET1", "Content Analytics", "Get content by ID (1)", headers=headers)
safe_call("GET", "/content/999999", "AUTO-CONTENT-INVALID", "Content Analytics", "Get content with invalid ID", headers=headers)
safe_call("GET", "/analytics/content/1/engagement", "AUTO-CONTENT-ENGAGE", "Content Analytics", "Content engagement analytics", headers=headers)
safe_call("GET", "/analytics/top-content", "AUTO-CONTENT-TOP", "Content Analytics", "Top performing content", headers=headers)
safe_call("GET", "/analytics/platform-performance", "AUTO-PLATFORM-PERF", "Multi-Platform", "Platform performance", headers=headers)
safe_call("GET", "/analytics/platform-comparison", "AUTO-PLATFORM-COMPARE", "Multi-Platform", "Platform comparison", headers=headers)
safe_call("GET", "/analytics/platforms", "AUTO-PLATFORM-LIST", "Multi-Platform", "Available platforms", headers=headers)
safe_call("GET", "/analytics/summary", "AUTO-DASH-SUMMARY", "Dashboard", "Dashboard summary", headers=headers)
safe_call("GET", "/analytics/chart/engagement", "AUTO-CHART-ENGAGE", "Dashboard", "Engagement chart data", headers=headers)
safe_call("GET", "/analytics/chart/followers", "AUTO-CHART-FOLLOWERS", "Dashboard", "Followers chart data", headers=headers)

# ---------------------------------------------------------------
# YOUTUBE SYNC
# ---------------------------------------------------------------
safe_call("POST", "/social/youtube/sync", "AUTO-YT-SYNC", "YouTube Integration",
          "Synchronize YouTube data",
          json={"creator_id": 1, "channel_id": "UC_test_channel_id", "max_results": 10},
          headers=headers)

# ---------------------------------------------------------------
# REVENUE
# ---------------------------------------------------------------
safe_call("GET", "/revenue", "AUTO-REV-LIST", "Revenue Analytics", "Get all revenue records", headers=headers)

safe_call("POST", "/revenue", "AUTO-REV-CREATE", "Revenue Analytics",
          "Add revenue record",
          json={"creator_id": 1, "source": "sponsorship", "amount": 500.0,
                "currency": "USD", "description": "Auto test revenue", "date": str(date.today())},
          headers=headers)

safe_call("GET", "/revenue/1", "AUTO-REV-GET1", "Revenue Analytics", "Get revenue by ID (1)", headers=headers)
safe_call("GET", "/analytics/revenue", "AUTO-REV-SUMMARY", "Revenue Analytics", "Revenue summary", headers=headers)
safe_call("GET", "/analytics/revenue-trend", "AUTO-REV-TREND", "Revenue Analytics", "Revenue trend", headers=headers)

# ---------------------------------------------------------------
# SPONSORSHIP
# ---------------------------------------------------------------
safe_call("GET", "/sponsorship", "AUTO-SPON-LIST", "Sponsorship", "Get all sponsorships", headers=headers)

safe_call("POST", "/sponsorship", "AUTO-SPON-CREATE", "Sponsorship",
          "Create sponsorship record",
          json={"creator_id": 1, "brand_name": "AutoTest Brand", "campaign_name": "Test Campaign",
                "contract_value": 2000.0, "start_date": str(date.today())},
          headers=headers)

safe_call("GET", "/sponsorship/1", "AUTO-SPON-GET1", "Sponsorship", "Get sponsorship by ID (1)", headers=headers)

# ---------------------------------------------------------------
# NOTIFICATIONS
# ---------------------------------------------------------------
safe_call("GET", "/notifications", "AUTO-NOTIF-LIST", "Notifications", "Get all notifications", headers=headers)

notif_create = safe_call("POST", "/notifications", "AUTO-NOTIF-CREATE", "Notifications",
                          "Create notification",
                          json={"creator_id": 1, "type": "performance", "title": "Auto Test Alert",
                                "message": "This is an automated test notification."},
                          headers=headers)

safe_call("GET", "/notifications/1", "AUTO-NOTIF-GET1", "Notifications", "Get notification by ID (1)", headers=headers)
safe_call("PUT", "/notifications/1/read", "AUTO-NOTIF-READ", "Notifications", "Mark notification as read", headers=headers)
safe_call("POST", "/notifications/check-alerts", "AUTO-NOTIF-CHECK", "Notifications", "Check alerts", headers=headers)

# ---------------------------------------------------------------
# REPORTS
# ---------------------------------------------------------------
safe_call("GET", "/reports/generate", "AUTO-REPORT-GEN", "Reporting", "Generate report", headers=headers)
safe_call("GET", "/reports/export/pdf", "AUTO-REPORT-PDF", "PDF Export", "Export report as PDF", headers=headers)
safe_call("GET", "/reports/export/excel", "AUTO-REPORT-EXCEL", "Excel Export", "Export report as Excel", headers=headers)

# ---------------------------------------------------------------
# ROOT
# ---------------------------------------------------------------
safe_call("GET", "/", "AUTO-ROOT", "Navigation", "Root endpoint", headers=headers)

# ---------------------------------------------------------------
# Save results
# ---------------------------------------------------------------
with open("results.csv", "w", newline="", encoding="utf-8") as f:
    writer = csv.DictWriter(f, fieldnames=["Test Case ID", "Module", "Test Scenario", "HTTP", "Status Code", "Actual Result"])
    writer.writeheader()
    writer.writerows(results)

print(f"\nDone. {len(results)} real results saved to results.csv")
print("Upload results.csv back to Claude to merge it into your test sheet.")
