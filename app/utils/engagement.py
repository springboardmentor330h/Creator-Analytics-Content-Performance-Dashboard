def calculate_engagement_rate(
    likes: int,
    comments: int,
    shares: int,
    saves: int,
    reach: int
) -> float:

    if reach == 0:
        return 0.0

    engagement_rate = (
        (likes + comments + shares + saves) / reach
    ) * 100

    return round(engagement_rate, 2)
