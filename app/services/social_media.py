from datetime import date, timedelta
MOCK_PLATFORMS = {
 "YouTube":[("Python Tutorial","YT-DEMO-001",15000,1200,150,100,18000,3500),("FastAPI Tutorial","YT-DEMO-002",12000,800,120,60,15000,3000)],
 "Instagram":[("Creator Tips","IG-DEMO-001",9800,1100,95,180,12500,0),("Reels Editing","IG-DEMO-002",18500,2100,140,250,23000,0)],
 "LinkedIn":[("Career Roadmap","LI-DEMO-001",5200,430,55,40,7000,0),("Python Skills","LI-DEMO-002",6800,520,72,55,8500,0)],
 "Facebook":[("Web Development","FB-DEMO-001",7400,610,80,70,9000,0),("SQL Basics","FB-DEMO-002",6300,500,65,52,7800,0)],
 "TikTok":[("Coding Hack","TT-DEMO-001",22000,3200,210,400,27000,0)],
 "X":[("Tech Update","X-DEMO-001",4100,300,45,35,5200,0)]
}
CONNECTED={}
def connect(creator_id, platform, account_name):
    CONNECTED.setdefault(creator_id,{})[platform]=account_name
    return {"message":f"{platform} account connected successfully"}
def platforms(creator_id):
    return {"platforms":sorted(CONNECTED.get(creator_id,{}).keys())}
def mock_data(platform):
    return MOCK_PLATFORMS.get(platform, [])
