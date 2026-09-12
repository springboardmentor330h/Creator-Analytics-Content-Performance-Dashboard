from pydantic import BaseModel, Field


class InstagramSeedRequest(BaseModel):
    num_posts: int = Field(40, ge=5, le=200)


class InstagramSeedResponse(BaseModel):
    posts_created: int
    posts_updated: int
    growth_points_created: int
    growth_points_updated: int
    final_follower_count: int
