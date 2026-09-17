import random
from datetime import date, timedelta


class LinkedInAPIError(Exception):
    """Raised when LinkedIn data fetch fails or returns invalid data."""
    pass


# Mock post templates — simulates what a real LinkedIn API response would contain.
# Real access requires LinkedIn Marketing API partner approval, which involves
# a lengthy application and business verification process not feasible within
# this sprint's timeframe.
MOCK_POST_TEMPLATES = [
    {"external_content_id": "li_post_2001", "caption": "Excited to share insights from our latest creator economy report 📊"},
    {"external_content_id": "li_post_2002", "caption": "5 lessons I learned building a content brand from scratch"},
    {"external_content_id": "li_post_2003", "caption": "Proud to announce a new partnership this quarter"},
    {"external_content_id": "li_post_2004", "caption": "Thoughts on where creator monetization is heading in 2026"},
    {"external_content_id": "li_post_2005", "caption": "Behind the scenes: how our team plans monthly content"},
    {"external_content_id": "li_post_2006", "caption": "A short thread on audience growth strategies that actually work"},
    {"external_content_id": "li_post_2007", "caption": "Reflecting on a year of building in public"},
    {"external_content_id": "li_post_2008", "caption": "Hiring update: we're growing the team!"},
    {"external_content_id": "li_post_2009", "caption": "Key takeaways from a recent industry panel I spoke at"},
    {"external_content_id": "li_post_2010", "caption": "Milestone: crossed a major follower count this week 🎉"},
]


def fetch_page_posts(li_org_id: str, max_results: int = 10) -> list:
    """
    Simulates fetching recent posts for a LinkedIn organization/profile.
    In a live integration, this would call LinkedIn's Marketing API
    (Community Management API for posts, Analytics API for engagement).
    Mock data is used because real access requires LinkedIn Partner Program
    approval, which involves a lengthy application and business verification
    process not feasible within this sprint.
    """
    if not li_org_id:
        raise LinkedInAPIError("LinkedIn organization/profile ID is required.")

    selected = MOCK_POST_TEMPLATES[:max_results]
    if not selected:
        raise LinkedInAPIError(f"No mock posts available for account: {li_org_id}")

    return selected


def transform_to_common_format(post: dict, creator_id: int) -> dict:
    """
    Transforms a (mock) LinkedIn post into CreatorIQ's common content format.
    Field availability mirrors real LinkedIn API limitations at standard
    access tiers: impressions map to 'views', reactions map to 'likes'.
    """
    likes = random.randint(50, 2500)         # LinkedIn calls these "reactions"
    comments = random.randint(5, 200)
    impressions = int(likes * random.uniform(15, 30))  # LinkedIn exposes impressions, used here as views
    reach = int(impressions * random.uniform(0.6, 0.9))
    published_date = date.today() - timedelta(days=random.randint(0, 90))

    caption = post["caption"]
    title = (caption[:100] + "...") if len(caption) > 100 else caption

    return {
        "creator_id": creator_id,
        "platform": "LinkedIn",
        "external_content_id": post["external_content_id"],
        "content_title": title,
        "views": impressions,   # LinkedIn's closest equivalent metric is "impressions"
        "likes": likes,
        "comments": comments,
        "shares": 0,             # Requires Marketing API partner access, not available at standard tier
        "saves": 0,              # Not exposed by LinkedIn's API at all
        "watch_time": 0.0,       # Only applies to native video posts with deeper analytics access
        "reach": reach,
        "published_date": published_date
    }


def get_account_content_in_common_format(li_org_id: str, creator_id: int, max_results: int = 10) -> list:
    """Full pipeline: fetch posts -> transform to CreatorIQ format."""
    posts = fetch_page_posts(li_org_id, max_results=max_results)
    return [transform_to_common_format(p, creator_id) for p in posts]