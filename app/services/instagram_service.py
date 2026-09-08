import os

from dotenv import load_dotenv

load_dotenv(override=True)

INSTAGRAM_ACCESS_TOKEN = os.getenv("INSTAGRAM_ACCESS_TOKEN")

import requests


class InstagramAPIError(Exception):
    """Custom exception for Instagram API errors."""

    def __init__(self, message: str, status_code: int = 500):
        self.message = message
        self.status_code = status_code
        super().__init__(message)


def get_instagram_access_token():
    """Return the configured Instagram access token."""

    if not INSTAGRAM_ACCESS_TOKEN:
        raise InstagramAPIError(
            "INSTAGRAM_ACCESS_TOKEN is not configured",
            500
        )

    return INSTAGRAM_ACCESS_TOKEN

import requests


def get_instagram_profile():
    """Fetch the Instagram account profile."""

    token = get_instagram_access_token()

    url = "https://graph.instagram.com/me"

    params = {
        "fields": "user_id,username",
        "access_token": token
    }

    response = requests.get(url, params=params)

    if response.status_code != 200:
        raise InstagramAPIError(
            f"Instagram API request failed: {response.text}",
            response.status_code
        )

    return response.json()


def get_instagram_follower_count():
    """Fetch the real Instagram follower count."""

    token = get_instagram_access_token()

    url = "https://graph.instagram.com/me"

    params = {
        "fields": "user_id,username,followers_count",
        "access_token": token
    }

    response = requests.get(url, params=params)

    if response.status_code != 200:
        raise InstagramAPIError(
            f"Instagram follower count request failed: {response.text}",
            response.status_code
        )

    data = response.json()

    followers_count = data.get("followers_count")

    if followers_count is None:
        raise InstagramAPIError(
            "Instagram API did not return followers_count",
            500
        )

    return int(followers_count)



def get_instagram_media(
    user_id: str,
    limit: int = 10
):
    """Fetch Instagram media for the connected account."""

    token = get_instagram_access_token()

    url = f"https://graph.instagram.com/{user_id}/media"

    params = {
        "fields": "id,caption,media_type,media_url,permalink,timestamp,like_count,comments_count",
        "limit": limit,
        "access_token": token
    }

    response = requests.get(url, params=params)

    if response.status_code != 200:
        raise InstagramAPIError(
            f"Instagram media request failed: {response.text}",
            response.status_code
        )

    return response.json()

def get_instagram_media_insights(media_id: str):
    """Fetch available insights for an Instagram media item."""

    token = get_instagram_access_token()

    url = f"https://graph.instagram.com/{media_id}/insights"

    params = {
        "metric": "likes,comments,shares,saved,reach",
        "access_token": token
    }

    response = requests.get(url, params=params)

    if response.status_code != 200:
        raise InstagramAPIError(
            f"Instagram insights request failed: {response.text}",
            response.status_code
        )

    return response.json()

def transform_instagram_media(media: dict, insights: dict):
    """Transform Instagram media and insights into CreatorIQ format."""

    media_id = media.get("id")

    if not media_id:
        raise ValueError("Instagram media ID is missing")

    timestamp = media.get("timestamp")

    if not timestamp:
        raise ValueError(
            f"Published date missing for Instagram media: {media_id}"
        )

    # Convert Instagram insights into a simple dictionary
    insight_values = {}

    for item in insights.get("data", []):
        name = item.get("name")
        values = item.get("values", [])

        if name and values:
            insight_values[name] = values[0].get("value")

    return {
        "platform": "Instagram",
        "external_content_id": media_id,
        "content_title": media.get("caption", "Instagram Post"),
        "views": None,
        "likes": insight_values.get(
            "likes",
            media.get("like_count")
        ),
        "comments": insight_values.get(
            "comments",
            media.get("comments_count")
        ),
        "shares": insight_values.get("shares"),
        "saves": insight_values.get("saved"),
        "watch_time": None,
        "reach": insight_values.get("reach"),
        "published_date": timestamp[:10],
    }