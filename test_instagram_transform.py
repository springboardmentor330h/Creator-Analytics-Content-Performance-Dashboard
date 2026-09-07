from app.services.instagram_service import (
    get_instagram_media,
    get_instagram_media_insights,
    transform_instagram_media,
)


media_response = get_instagram_media(limit=10)

media_items = media_response.get("data", [])

if not media_items:
    print("No Instagram media found.")
    raise SystemExit

for media in media_items:
    media_id = media["id"]

    insights = get_instagram_media_insights(media_id)

    transformed = transform_instagram_media(
        media,
        insights
    )

    print("\nCreatorIQ transformed data:")
    print(transformed)