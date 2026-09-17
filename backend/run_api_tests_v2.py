"""
CreatorIQ Automated API Test Runner v2
----------------------------------------
Fixes from v1:
- Sends creator_id query param (required by revenue/sponsorship/notifications/reports)
- Sends x-role header for /dashboard/overview
- Uses the REAL id returned when creating a record, instead of guessing id=1

HOW TO RUN (same as before):
1. Make sure your FastAPI server is running (uvicorn app.main:app --reload)
2. In a SEPARATE terminal window: python run_api_tests_v2.py
3. Upload the new results.csv it creates
"""

import requests
import csv
import json
from datetime import date

BASE_URL = "http://127.0.0.1:8000"
EMAIL = "sakshi@example.com"
PASSWORD = "Sakshi@123"
CREATOR_ID = 1  # adjust if your own user/creator id is different

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
        "Test Case ID": test_id, "Module": module, "Test Scenario": scenario,
        "HTTP": f"{method} {path}", "Status Code": status_code, "Actual Result": actual,
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


def get_id(resp, key="id"):
    """Pull the id out of a create response, if available."""
    if resp is not None and resp.status_code in (200, 201):
        try:
            return resp.json().get(key)
        except Exception:
            pass
    return None


# ---------------- AUTH ----------------
login_resp = safe_call("POST", "/auth/login", "AUTO-AUTH-LOGIN", "Authentication",
                        "Login with valid credentials", json={"email": EMAIL, "password": PASSWORD})
token = None
if login_resp is not None and login_resp.status_code == 200:
    token = login_resp.json().get("access_token")
headers = {"Authorization": f"Bearer {token}"} if token else {}
if not token:
    print("\n*** WARNING: no token obtained — protected routes will show real 401s. ***\n")

safe_call("GET", "/users/me", "AUTO-AUTH-VALIDTOKEN", "Authentication",
          "Access protected API with valid token", headers=headers)

# ---------------- DASHBOARD (with x-role header) ----------------
for role in ["creator", "agency", "marketing", "admin"]:
    h = dict(headers)
    h["x-role"] = role
    safe_call("GET", "/dashboard/overview", f"AUTO-DASH-{role.upper()}", "Dashboard",
               f"Dashboard overview as role={role}", headers=h)

# ---------------- AUDIENCE ----------------
aud_resp = safe_call("POST", "/audience", "AUTO-AUD-CREATE", "Audience Analytics",
                      "Create audience record",
                      json={"creator_id": CREATOR_ID, "age_group": "18-24", "gender": "female",
                            "country": "India", "city": "Bengaluru", "device_type": "mobile",
                            "active_hour": 20, "followers": 1000, "impressions": 5000, "reach": 3000},
                      headers=headers)
aud_id = get_id(aud_resp) or 1
safe_call("GET", f"/audience/{aud_id}", "AUTO-AUD-GET", "Audience Analytics",
          "Get audience by real created ID", headers=headers)
safe_call("GET", "/analytics/audience", "AUTO-AUD-REPORT", "Audience Analytics",
          "Audience analytics report", headers=headers)

# ---------------- CONTENT ----------------
content_resp = safe_call("POST", "/content", "AUTO-CONTENT-CREATE", "Content Analytics",
                          "Create content record",
                          json={"creator_id": CREATOR_ID, "platform": "YouTube", "content_title": "Auto Test Video",
                                "views": 1000, "likes": 100, "comments": 10, "shares": 5, "saves": 2,
                                "watch_time": 120.5, "reach": 800, "published_date": str(date.today())},
                          headers=headers)
content_id = get_id(content_resp) or 1
safe_call("GET", f"/content/{content_id}", "AUTO-CONTENT-GET-REAL", "Content Analytics",
          "Fetch content with the real created ID", headers=headers)
safe_call("GET", f"/analytics/content/{content_id}/engagement", "AUTO-CONTENT-ENGAGE-REAL", "Content Analytics",
          "Content engagement analytics with real ID", headers=headers)
safe_call("GET", "/content/999999", "AUTO-CONTENT-INVALID", "Content Analytics",
          "Get content with invalid ID", headers=headers)

# ---------------- REVENUE (now with creator_id) ----------------
rev_resp = safe_call("POST", "/revenue", "AUTO-REV-CREATE", "Revenue Analytics",
                      "Add revenue record",
                      json={"creator_id": CREATOR_ID, "source": "sponsorship", "amount": 500.0,
                            "currency": "USD", "description": "Auto test revenue", "date": str(date.today())},
                      headers=headers)
rev_id = get_id(rev_resp) or 1
safe_call("GET", f"/revenue?creator_id={CREATOR_ID}", "AUTO-REV-LIST", "Revenue Analytics",
          "Get all revenue records for creator", headers=headers)
safe_call("GET", f"/revenue/{rev_id}?creator_id={CREATOR_ID}", "AUTO-REV-GET", "Revenue Analytics",
          "Get revenue by real ID", headers=headers)
safe_call("GET", f"/analytics/revenue?creator_id={CREATOR_ID}", "AUTO-REV-SUMMARY", "Revenue Analytics",
          "Fetch total revenue", headers=headers)
safe_call("GET", f"/analytics/revenue-trend?creator_id={CREATOR_ID}", "AUTO-REV-TREND", "Revenue Analytics",
          "Generate monthly revenue trend", headers=headers)

# ---------------- SPONSORSHIP (now with creator_id) ----------------
spon_resp = safe_call("POST", "/sponsorship", "AUTO-SPON-CREATE", "Sponsorship",
                       "Create sponsorship record",
                       json={"creator_id": CREATOR_ID, "brand_name": "AutoTest Brand", "campaign_name": "Test Campaign",
                             "contract_value": 2000.0, "start_date": str(date.today())},
                       headers=headers)
spon_id = get_id(spon_resp) or 1
safe_call("GET", f"/sponsorship?creator_id={CREATOR_ID}", "AUTO-SPON-LIST", "Sponsorship",
          "View sponsorship records", headers=headers)
safe_call("GET", f"/sponsorship/{spon_id}?creator_id={CREATOR_ID}", "AUTO-SPON-GET", "Sponsorship",
          "Get sponsorship by real ID", headers=headers)

# ---------------- NOTIFICATIONS (now with creator_id) ----------------
notif_resp = safe_call("POST", "/notifications", "AUTO-NOTIF-CREATE", "Notifications",
                        "Create notification",
                        json={"creator_id": CREATOR_ID, "type": "performance", "title": "Auto Test Alert",
                              "message": "This is an automated test notification."},
                        headers=headers)
notif_id = get_id(notif_resp) or 1
safe_call("GET", f"/notifications?creator_id={CREATOR_ID}", "AUTO-NOTIF-LIST", "Notifications",
          "View unread notifications", headers=headers)
safe_call("PUT", f"/notifications/{notif_id}/read?creator_id={CREATOR_ID}", "AUTO-NOTIF-READ", "Notifications",
          "Mark notification as read", headers=headers)
safe_call("POST", f"/notifications/check-alerts?creator_id={CREATOR_ID}", "AUTO-NOTIF-CHECK", "Notifications",
          "Check alerts", headers=headers)

# ---------------- REPORTS (now with creator_id) ----------------
safe_call("GET", f"/reports/generate?creator_id={CREATOR_ID}", "AUTO-REPORT-GEN", "Reporting",
          "Generate report", headers=headers)
safe_call("GET", f"/reports/export/pdf?creator_id={CREATOR_ID}", "AUTO-REPORT-PDF", "PDF Export",
          "Export report as PDF", headers=headers)
safe_call("GET", f"/reports/export/excel?creator_id={CREATOR_ID}", "AUTO-REPORT-EXCEL", "Excel Export",
          "Export report as Excel", headers=headers)

# ---------------- PROFILE ----------------
safe_call("GET", "/users/me", "AUTO-PROFILE-VIEW", "Profile", "View own profile", headers=headers)

# ---------------- Save ----------------
with open("results_v2.csv", "w", newline="", encoding="utf-8") as f:
    writer = csv.DictWriter(f, fieldnames=["Test Case ID", "Module", "Test Scenario", "HTTP", "Status Code", "Actual Result"])
    writer.writeheader()
    writer.writerows(results)

print(f"\nDone. {len(results)} real results saved to results_v2.csv")
print("Upload results_v2.csv back to Claude.")
