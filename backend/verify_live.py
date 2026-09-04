import urllib.request
import json

base = 'http://localhost:8000'

def get(path):
    req = urllib.request.urlopen(base + path)
    return json.loads(req.read().decode('utf-8'))

print("=== 1. VERIFY /users/me ===")
u = get('/users/me')
print(f"User ID: {u['id']}, Name: {u['full_name']}, Email: {u['email']}, Role: {u['role']}")

print("\n=== 2. VERIFY DASHBOARD (/reports) PER PLATFORM ===")
for p in ['All', 'YouTube', 'Instagram', 'TikTok', 'LinkedIn', 'X', 'Facebook']:
    rep = get(f'/reports?platform={p}')
    cp = rep.get('content_performance', {})
    print(f"[{p:10s}] Posts: {cp.get('total_content'):2d} | Views: {cp.get('total_views'):9,d} | Likes: {cp.get('total_likes'):7,d} | Comments: {cp.get('total_comments'):5,d} | Shares: {cp.get('total_shares'):5,d} | Reach: {cp.get('total_reach'):9,d}")

print("\n=== 3. VERIFY CONTENT REPORT (/reports/content) PER PLATFORM ===")
for p in ['All', 'YouTube', 'Instagram', 'TikTok', 'LinkedIn', 'X', 'Facebook']:
    rep = get(f'/reports/content?platform={p}')
    print(f"[{p:10s}] Posts: {rep.get('total_content'):2d} | Views: {rep.get('total_views'):9,d} | Likes: {rep.get('total_likes'):7,d} | Comments: {rep.get('total_comments'):5,d} | Shares: {rep.get('total_shares'):5,d} | Reach: {rep.get('total_reach'):9,d} | Items: {len(rep.get('data', [])):2d}")

print("\n=== 4. VERIFY AUDIENCE REPORT (/reports/audience) PER PLATFORM ===")
for p in ['All', 'YouTube', 'Instagram', 'TikTok', 'LinkedIn', 'X', 'Facebook']:
    rep = get(f'/reports/audience?platform={p}')
    print(f"[{p:10s}] Followers: {rep.get('total_followers'):8,d} | Reach: {rep.get('total_reach'):9,d} | Impressions: {rep.get('total_impressions'):9,d} | Segments: {len(rep.get('data', [])):2d}")

print("\n=== 5. VERIFY REVENUE REPORT (/reports/revenue) PER PLATFORM ===")
for p in ['All', 'YouTube', 'Instagram', 'TikTok', 'LinkedIn', 'X', 'Facebook']:
    rep = get(f'/reports/revenue?platform={p}')
    print(f"[{p:10s}] Total Revenue: INR {rep.get('total_revenue'):8,d} | Transactions: {len(rep.get('data', [])):2d}")

print("\n=== 6. VERIFY SPONSORSHIPS (/sponsorships) PER PLATFORM ===")
for p in ['All', 'YouTube', 'Instagram', 'TikTok', 'LinkedIn', 'X', 'Facebook']:
    rep = get(f'/sponsorships?platform={p}')
    print(f"[{p:10s}] Sponsorships Count: {len(rep):2d} | Value: INR {sum(s.get('contract_value', 0) for s in rep):7,d}")
