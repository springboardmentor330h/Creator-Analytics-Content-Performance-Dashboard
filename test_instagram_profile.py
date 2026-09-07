from app.services.instagram_service import get_instagram_profile

try:
    profile = get_instagram_profile()

    print("Instagram Profile:")
    print("User ID:", profile.get("user_id"))
    print("Username:", profile.get("username"))

except Exception as e:
    print("Instagram API Error:", str(e))