from app.services.instagram_service import (
    get_instagram_media,
    get_instagram_media_insights,
)


try:
    # Get Instagram media
    response = get_instagram_media(
    user_id="17841476670424455",
    limit=25
)

    media_items = response.get("data", [])

    print("\nInstagram media found:", len(media_items))
    print("=" * 80)

    for media in media_items:

        media_id = media.get("id")
        media_type = media.get("media_type")
        timestamp = media.get("timestamp")

        print("\nMedia ID:", media_id)
        print("Media Type:", media_type)
        print("Published:", timestamp)

        try:
            insights = get_instagram_media_insights(media_id)

            print("Available Insights:")

            for item in insights.get("data", []):
                name = item.get("name")
                values = item.get("values", [])

                if values:
                    value = values[0].get("value")
                    print(f"  {name}: {value}")

        except Exception as e:
            print("Insights Error:", str(e))

        print("-" * 80)


except Exception as e:
    print("Instagram API Error:", str(e))