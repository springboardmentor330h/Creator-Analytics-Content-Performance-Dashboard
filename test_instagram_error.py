from app.services.instagram_service import get_instagram_media_insights, InstagramAPIError

try:
    get_instagram_media_insights("invalid_media_id_12345")

except InstagramAPIError as e:
    print("Instagram error handled successfully!")
    print("Status code:", e.status_code)
    print("Message:", e.message)