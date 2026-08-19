from app.services.youtube_service import (
    get_channel_videos,
    get_video_details,
    transform_video_data
)


CHANNEL_ID = "UC_x5XG1OV2P6uZZ5FSM9Ttw"


try:
    playlist_data = get_channel_videos(
        CHANNEL_ID,
        max_results=5
    )

    video_ids = [
        item["contentDetails"]["videoId"]
        for item in playlist_data.get("items", [])
    ]

    videos = get_video_details(video_ids)

    print("\nCreatorIQ transformed data:\n")

    for video in videos:
        transformed = transform_video_data(video)
        print(transformed)

except Exception as e:
    print("YouTube API request failed:")
    print(e)