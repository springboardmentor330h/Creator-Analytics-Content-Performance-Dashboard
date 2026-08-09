from app.services.content_analytics_service import get_content_analytics
from app.services.youtube_service import (
    search_videos,
    get_video_details,
)


# Test 1: Search videos
response = search_videos("Python programming", 5)

for item in response["items"]:
    print(
        item["id"]["videoId"],
        "->",
        item["snippet"]["title"]
    )


# Test 2: Get video details
video = get_video_details("kqtD5dpn9C8")

print("\nVIDEO DETAILS:")
print(video)


# Test 3: Content analytics
video_id = "kqtD5dpn9C8"

analytics = get_content_analytics(video_id)

print("\nCONTENT ANALYTICS:")
print(analytics)