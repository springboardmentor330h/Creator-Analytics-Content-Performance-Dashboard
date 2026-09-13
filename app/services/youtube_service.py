import os
import requests
from datetime import datetime
from dotenv import load_dotenv
from fastapi import HTTPException

load_dotenv()

class YouTubeService:
    BASE="https://www.googleapis.com/youtube/v3"

    @classmethod
    def fetch_channel_videos(cls, channel_id: str, max_results: int=10):
        key=os.getenv("YOUTUBE_API_KEY")
        if not key or key in ("your_key_here",""):
            raise HTTPException(503,"YOUTUBE_API_KEY is not configured. Add it to .env before using YouTube sync.")
        try:
            search=requests.get(f"{cls.BASE}/search",params={"part":"snippet","channelId":channel_id,
                "maxResults":max_results,"order":"date","type":"video","key":key},timeout=15)
            if search.status_code in (401,403): raise HTTPException(search.status_code,"YouTube API authentication/quota error.")
            search.raise_for_status()
            items=search.json().get("items",[])
            ids=[x["id"]["videoId"] for x in items if x.get("id",{}).get("videoId")]
            if not ids: return []
            details=requests.get(f"{cls.BASE}/videos",params={"part":"snippet,statistics,contentDetails",
                "id":",".join(ids),"key":key},timeout=15)
            if details.status_code in (401,403): raise HTTPException(details.status_code,"YouTube API authentication/quota error.")
            details.raise_for_status()
            out=[]
            for v in details.json().get("items",[]):
                s=v.get("statistics",{}); sn=v.get("snippet",{})
                out.append({"platform":"YouTube","external_content_id":v["id"],
                    "content_title":sn.get("title","Untitled"),
                    "views":int(s.get("viewCount",0) or 0),"likes":int(s.get("likeCount",0) or 0),
                    "comments":int(s.get("commentCount",0) or 0),"shares":0,
                    "saves":0,"watch_time":0,"reach":int(s.get("viewCount",0) or 0),
                    "published_date":datetime.fromisoformat(sn["publishedAt"].replace("Z","+00:00")).date()})
            return out
        except requests.RequestException as exc:
            raise HTTPException(502,f"YouTube API request failed: {exc}")
