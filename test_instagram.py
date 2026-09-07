from app.services.instagram_service import (
    get_instagram_media,
    get_instagram_media_insights
)


try:
    media = get_instagram_media()
    items = media.get("data", [])

    print("Instagram media API successful!")
    print("Number of media:", len(items))

    if items:
        media_id = items[0]["id"]

        print("\nTesting Instagram Insights...")
        insights = get_instagram_media_insights(media_id)

        print("Instagram Insights API successful!")
        print(insights)

except Exception as e:
    print("Instagram Insights API failed.")
    print("Error:", str(e))