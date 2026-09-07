from app.services.instagram_service import get_instagram_access_token
import requests


INSTAGRAM_USER_ID = "17841476670424455"


try:
    token = get_instagram_access_token()

    url = f"https://graph.instagram.com/{INSTAGRAM_USER_ID}/media"

    params = {
        "fields": "id,caption,media_type,timestamp,like_count,comments_count",
        "limit": 25,
        "access_token": token
    }

    response = requests.get(url, params=params)

    print("Status Code:", response.status_code)

    if response.status_code != 200:
        print("Instagram API Error:")
        print(response.text)
    else:
        data = response.json()
        media_items = data.get("data", [])

        print("\nInstagram media found:", len(media_items))
        print("=" * 80)

        for media in media_items:
            print("\nMedia ID:", media.get("id"))
            print("Media Type:", media.get("media_type"))
            print("Caption:", media.get("caption", "No caption"))
            print("Published:", media.get("timestamp"))
            print("Likes:", media.get("like_count"))
            print("Comments:", media.get("comments_count"))
            print("-" * 80)

except Exception as e:
    print("Error:", str(e))