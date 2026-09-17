"""
CreatorIQ Automated API Test Runner v3
------------------------------------------
Covers: Database (create -> update -> verify -> delete lifecycle),
Security checks, and Profile update tests.

NOTE: This script creates a test content record, updates it, verifies
the update, then DELETES it -- so it cleans up after itself.

HOW TO RUN (same as before): keep server running in one window,
then in a second window: python run_api_tests_v3.py
"""

import requests
import csv
import json
from datetime import date

BASE_URL = "http://127.0.0.1:8000"
EMAIL = "sakshi@example.com"
PASSWORD = "Sakshi@123"
CREATOR_ID = 1

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


def get_id(resp):
    if resp is not None and resp.status_code in (200, 201):
        try:
            return resp.json().get("id")
        except Exception:
            pass
    return None


# ---------------- LOGIN ----------------
login_resp = safe_call("POST", "/auth/login", "AUTO3-LOGIN", "Authentication",
                        "Login with valid credentials", json={"email": EMAIL, "password": PASSWORD})
token = login_resp.json().get("access_token") if login_resp and login_resp.status_code == 200 else None
headers = {"Authorization": f"Bearer {token}"} if token else {}

# ---------------- SECURITY ----------------
safe_call("GET", "/content", "AUTO3-SEC-NOAUTH", "Security",
          "Access API without authentication (no header at all)")

safe_call("GET", "/content", "AUTO3-SEC-BADJWT", "Security",
          "Use a syntactically invalid JWT", headers={"Authorization": "Bearer not.a.valid.jwt.at.all"})

me_resp = safe_call("GET", "/users/me", "AUTO3-SEC-SENSITIVE", "Security",
                     "Verify sensitive data is not exposed in API response", headers=headers)
if me_resp is not None and me_resp.status_code == 200:
    body = me_resp.json()
    has_password_field = any(k.lower() in ("password", "password_hash", "hashed_password") for k in body.keys())
    print(f"    -> /users/me exposes password-related field: {has_password_field}")

# ---------------- DATABASE: full CRUD lifecycle on a content record ----------------
create_resp = safe_call("POST", "/content", "AUTO3-DB-CREATE", "Database",
                         "Create record",
                         json={"creator_id": CREATOR_ID, "platform": "YouTube", "content_title": "DB Lifecycle Test",
                               "views": 100, "likes": 10, "comments": 1, "shares": 1, "saves": 0,
                               "watch_time": 30.0, "reach": 90, "published_date": str(date.today())},
                         headers=headers)
new_id = get_id(create_resp)

if new_id:
    safe_call("PUT", f"/content/{new_id}", "AUTO3-DB-UPDATE", "Database",
              "Update record", json={"content_title": "DB Lifecycle Test (Updated)", "views": 500},
              headers=headers)

    verify_resp = safe_call("GET", f"/content/{new_id}", "AUTO3-DB-VERIFY", "Database",
                             "Verify update persisted", headers=headers)
    if verify_resp is not None and verify_resp.status_code == 200:
        title = verify_resp.json().get("content_title", "")
        print(f"    -> Title after update: {title}")

    safe_call("DELETE", f"/content/{new_id}", "AUTO3-DB-DELETE", "Database",
              "Delete record, if supported", headers=headers)

    safe_call("GET", f"/content/{new_id}", "AUTO3-DB-VERIFY-DELETE", "Database",
              "Verify record no longer exists after delete", headers=headers)
else:
    print("    -> Could not create a record to test update/delete on.")

# ---------------- DUPLICATE DATA CHECK ----------------
dup1 = safe_call("POST", "/content", "AUTO3-DB-DUP1", "Database",
                  "Create first record for duplicate check",
                  json={"creator_id": CREATOR_ID, "platform": "YouTube", "content_title": "Duplicate Check Video",
                        "views": 50, "likes": 5, "comments": 0, "shares": 0, "saves": 0,
                        "watch_time": 10.0, "reach": 40, "published_date": str(date.today())},
                  headers=headers)
dup2 = safe_call("POST", "/content", "AUTO3-DB-DUP2", "Database",
                  "Create identical second record to see if duplicates are prevented/handled",
                  json={"creator_id": CREATOR_ID, "platform": "YouTube", "content_title": "Duplicate Check Video",
                        "views": 50, "likes": 5, "comments": 0, "shares": 0, "saves": 0,
                        "watch_time": 10.0, "reach": 40, "published_date": str(date.today())},
                  headers=headers)

# ---------------- PROFILE UPDATE ----------------
me_resp2 = safe_call("GET", "/users/me", "AUTO3-PROFILE-GETME", "Profile",
                      "Get own user id before updating", headers=headers)
my_id = None
if me_resp2 is not None and me_resp2.status_code == 200:
    my_id = me_resp2.json().get("id")

if my_id:
    safe_call("PUT", f"/users/{my_id}", "AUTO3-PROFILE-UPDATE", "Profile",
              "Update profile with valid data",
              json={"full_name": "Sakshi S Badiger"}, headers=headers)

    safe_call("PUT", f"/users/{my_id}", "AUTO3-PROFILE-INVALID", "Profile",
              "Update profile with invalid data (empty name)",
              json={"full_name": ""}, headers=headers)

    verify_profile = safe_call("GET", "/users/me", "AUTO3-PROFILE-VERIFY", "Profile",
                                "Verify profile persistence after update", headers=headers)

# ---------------- Save ----------------
with open("results_v3.csv", "w", newline="", encoding="utf-8") as f:
    writer = csv.DictWriter(f, fieldnames=["Test Case ID", "Module", "Test Scenario", "HTTP", "Status Code", "Actual Result"])
    writer.writeheader()
    writer.writerows(results)

print(f"\nDone. {len(results)} real results saved to results_v3.csv")
print("Upload results_v3.csv back to Claude.")
