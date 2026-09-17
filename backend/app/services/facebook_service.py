import random
from datetime import date, timedelta


class FacebookAPIError(Exception):
    """Raised when Facebook data fetch fails or returns invalid data."""
    pass


# Mock post templates — simulates what a real Facebook Graph API response would contain.
# Real access requires a Facebook Page + Meta Developer app with pages_read_engagement
# permission, which needs a personal Facebook account and (for production use) app
# review — not set up within this sprint's timeframe.
MOCK_POST_TEMPLATES = [
    {"external_content_id": "fb_post_4001", "caption": "Big announcement coming soon, stay tuned!"},
    {"external_content_id": "fb_post_4002", "caption": "Throwback to where this journey started"},
    {"external_content_id": "fb_post_4003", "caption": "Thank you all for the amazing support this month"},
    {"external_content_id": "fb_post_4004", "caption": "New blog post is live, link in comments"},
    {"external_content_id": "fb_post_4005", "caption": "Live Q&A happening this Friday, drop your questions"},
    {"external_content_id": "fb_post_4006", "caption": "Behind the scenes from today's shoot"},
    {"external_content_id": "fb_post_4007", "caption": "Giveaway alert! Details in the post"},
    {"external_content_id": "fb_post_4008", "caption": "Celebrating a huge community milestone today"},
    {"external_content_id": "fb_post_4009", "caption": "Sharing some thoughts on this week's trends"},
    {"external_content_id": "fb_post_4010", "caption": "Excited to collaborate with a brand I truly love"},
]


def fetch_page_posts(page_id: str, max_results: int = 10) -> list:
    """
    Simulates fetching recent posts for a Facebook Page.
    In a live integration, this would call the Facebook Graph API's
    /{page-id}/posts endpoint with a Page Access Token. Mock data is used
    because real access requires creating a personal Facebook account and
    Meta Developer app, which wasn't set up within this sprint.
    """
    if not page_id:
        raise FacebookAPIError("Facebook Page ID is required.")

    selected = MOCK_POST_TEMPLATES[:max_results]
    if not selected:
        raise FacebookAPIError(f"No mock posts available for page: {page_id}")

    return selected


def transform_to_common_format(post: dict, creator_id: int) -> dict:
    """
    Transforms a (mock) Facebook post into CreatorIQ's common content format.
    Field availability mirrors real Facebook Graph API limitations at the
    standard permission tier: likes, comments, and shares ARE genuinely
    exposed via the Posts endpoint, but views/reach require the separate
    Page Insights permission (read_insights), which needs app review.
    """
    likes = random.randint(100, 4000)
    comments = random.randint(5, 300)
    shares = random.randint(2, 150)
    published_date = date.today() - timedelta(days=random.randint(0, 60))

    caption = post["caption"]
    title = (caption[:100] + "...") if len(caption) > 100 else caption

    return {
        "creator_id": creator_id,
        "platform": "Facebook",
        "external_content_id": post["external_content_id"],
        "content_title": title,
        "views": 0,            # Requires Page Insights permission (read_insights), needs app review
        "likes": likes,
        "comments": comments,
        "shares": shares,       # Genuinely available via standard Posts endpoint
        "saves": 0,             # Not exposed by Facebook's API
        "watch_time": 0.0,      # Only applies to video posts with Insights access
        "reach": 0,             # Requires Page Insights permission, same as views
        "published_date": published_date
    }


def get_page_content_in_common_format(page_id: str, creator_id: int, max_results: int = 10) -> list:
    """Full pipeline: fetch posts -> transform to CreatorIQ format."""
    posts = fetch_page_posts(page_id, max_results=max_results)
    return [transform_to_common_format(p, creator_id) for p in posts]