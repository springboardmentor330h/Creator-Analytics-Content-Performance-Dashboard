import random
from datetime import date, timedelta


class InstagramAPIError(Exception):
    """Raised when Instagram data fetch fails or returns invalid data."""
    pass


# Mock post templates — simulates what a real Instagram Graph API response would contain
MOCK_POST_TEMPLATES = [
    {"external_content_id": "ig_post_1001", "caption": "Behind the scenes of my latest shoot 📸"},
    {"external_content_id": "ig_post_1002", "caption": "New reel dropping this week, stay tuned!"},
    {"external_content_id": "ig_post_1003", "caption": "Collab announcement with a brand I love 💛"},
    {"external_content_id": "ig_post_1004", "caption": "Q&A highlights from yesterday's story"},
    {"external_content_id": "ig_post_1005", "caption": "My honest thoughts on the new gear I'm using"},
    {"external_content_id": "ig_post_1006", "caption": "Throwback to where it all started"},
    {"external_content_id": "ig_post_1007", "caption": "Tips for growing on Instagram in 2026"},
    {"external_content_id": "ig_post_1008", "caption": "Unboxing the products you asked about"},
    {"external_content_id": "ig_post_1009", "caption": "A day in my life as a content creator"},
    {"external_content_id": "ig_post_1010", "caption": "Thank you for 10K followers! 🎉"},
]


def fetch_account_posts(ig_user_id: str, max_results: int = 10) -> list:
    """
    Simulates fetching recent posts for an Instagram account.
    In a live integration, this would call the Instagram Graph API's
    /{ig-user-id}/media endpoint. Mock data is used here because
    real API access requires a linked Facebook Business account and
    app review, which wasn't feasible to set up for this sprint.
    """
    if not ig_user_id:
        raise InstagramAPIError("Instagram account ID is required.")

    selected = MOCK_POST_TEMPLATES[:max_results]
    if not selected:
        raise InstagramAPIError(f"No mock posts available for account: {ig_user_id}")

    return selected


def transform_to_common_format(post: dict, creator_id: int) -> dict:
    """
    Transforms a (mock) Instagram post into CreatorIQ's common content format.
    Field availability mirrors real Instagram Graph API limitations:
    views/shares are not exposed at the standard permission tier.
    """
    likes = random.randint(200, 5000)
    comments = random.randint(10, 400)
    reach = int(likes * random.uniform(3, 6))
    published_date = date.today() - timedelta(days=random.randint(0, 60))

    caption = post["caption"]
    title = (caption[:100] + "...") if len(caption) > 100 else caption

    return {
        "creator_id": creator_id,
        "platform": "Instagram",
        "external_content_id": post["external_content_id"],
        "content_title": title,
        "views": 0,          # Not exposed by Instagram Graph API for standard posts
        "likes": likes,
        "comments": comments,
        "shares": 0,          # Not available via Instagram Graph API
        "saves": 0,           # Requires deeper Insights permission
        "watch_time": 0.0,    # Only applies to Reels with Insights access
        "reach": reach,
        "published_date": published_date
    }


def get_account_content_in_common_format(ig_user_id: str, creator_id: int, max_results: int = 10) -> list:
    """Full pipeline: fetch posts -> transform to CreatorIQ format."""
    posts = fetch_account_posts(ig_user_id, max_results=max_results)
    return [transform_to_common_format(p, creator_id) for p in posts]