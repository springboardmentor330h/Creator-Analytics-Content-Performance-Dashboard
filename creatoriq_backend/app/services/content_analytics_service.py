from app.services.youtube_service import get_video_details

def get_content_analytics(video_id: str):

    video = get_video_details(video_id)

    if not video:
        return None

    snippet = video["snippet"]
    statistics = video.get("statistics", {})

    views = int(statistics.get("viewCount", 0))
    likes = int(statistics.get("likeCount", 0))
    comments = int(statistics.get("commentCount", 0))

    engagement_rate = 0

    if views > 0:
        engagement_rate = (
            (likes + comments) / views
        ) * 100

    return {
        "video_id": video["id"],
        "title": snippet["title"],
        "channel_title": snippet["channelTitle"],
        "published_at": snippet["publishedAt"],
        "views": views,
        "likes": likes,
        "comments": comments,
        "engagement_rate": round(engagement_rate, 2),
    }