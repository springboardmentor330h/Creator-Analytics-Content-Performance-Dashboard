import os

from dotenv import load_dotenv
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError


load_dotenv(override=True)

YOUTUBE_API_KEY = os.getenv("YOUTUBE_API_KEY")


class YouTubeAPIError(Exception):
    """
    Custom exception for YouTube API errors.
    """

    def __init__(self, message: str, status_code: int = 500):
        self.message = message
        self.status_code = status_code
        super().__init__(message)


def get_youtube_service():
    """
    Create and return a YouTube Data API v3 service client.
    """

    if not YOUTUBE_API_KEY:
        raise YouTubeAPIError(
            "YOUTUBE_API_KEY is not configured",
            500
        )

    return build(
        "youtube",
        "v3",
        developerKey=YOUTUBE_API_KEY
    )

def handle_youtube_error(error: HttpError):
    """
    Convert YouTube API errors into meaningful application errors.
    """

    status_code = error.resp.status

    error_message = str(error).lower()

    # Invalid API key
    if (
        "api key not valid" in error_message
        or "keyinvalid" in error_message
    ):
        raise YouTubeAPIError(
            "Invalid YouTube API key",
            401
        )

    # Invalid channel/video/request
    if status_code == 400:
        raise YouTubeAPIError(
            "Invalid YouTube request or channel/video ID",
            400
        )

    # Unauthorized
    if status_code == 401:
        raise YouTubeAPIError(
            "Invalid or unauthorized YouTube API key",
            401
        )

    # Forbidden / quota exceeded
    if status_code == 403:
        raise YouTubeAPIError(
            "YouTube API access forbidden or quota exceeded",
            403
        )

    # Resource not found
    if status_code == 404:
        raise YouTubeAPIError(
            "Requested YouTube resource was not found",
            404
        )

    # Rate limit
    if status_code == 429:
        raise YouTubeAPIError(
            "YouTube API rate limit exceeded",
            429
        )

    # Unexpected API error
    raise YouTubeAPIError(
        "YouTube API request failed",
        502
    )



def get_channel_details(channel_id: str):
    """
    Fetch basic information about a YouTube channel.
    """

    youtube = get_youtube_service()

    try:
        response = youtube.channels().list(
            part="snippet,contentDetails,statistics",
            id=channel_id
        ).execute()

        return response

    except HttpError as error:
        handle_youtube_error(error)


def get_uploads_playlist_id(channel_id: str):
    """
    Get the uploads playlist ID for a YouTube channel.
    """

    channel_data = get_channel_details(channel_id)

    items = channel_data.get("items", [])

    if not items:
        raise YouTubeAPIError(
            "YouTube channel not found",
            404
        )

    try:
        return items[0]["contentDetails"]["relatedPlaylists"]["uploads"]

    except KeyError:
        raise YouTubeAPIError(
            "Unexpected YouTube channel response",
            500
        )


def get_channel_videos(channel_id: str, max_results: int = 10):
    """
    Fetch video IDs from a YouTube channel's uploads playlist.
    """

    youtube = get_youtube_service()

    uploads_playlist_id = get_uploads_playlist_id(channel_id)

    try:
        response = youtube.playlistItems().list(
            part="snippet,contentDetails",
            playlistId=uploads_playlist_id,
            maxResults=max_results
        ).execute()

        return response

    except HttpError as error:
        handle_youtube_error(error)


def get_video_details(video_ids: list[str]):
    """
    Fetch details and statistics for YouTube videos.
    """

    if not video_ids:
        return []

    youtube = get_youtube_service()

    try:
        response = youtube.videos().list(
            part="snippet,contentDetails,statistics",
            id=",".join(video_ids)
        ).execute()

        return response.get("items", [])

    except HttpError as error:
        handle_youtube_error(error)


def transform_video_data(video: dict):
    """
    Transform YouTube video data into the common CreatorIQ format.
    """

    snippet = video.get("snippet", {})
    statistics = video.get("statistics", {})

    published_at = snippet.get("publishedAt")

    if not published_at:
        raise ValueError(
            f"Published date missing for video: {video.get('id')}"
        )

    video_id = video.get("id")

    if not video_id:
        raise ValueError(
            "YouTube video ID is missing"
        )

    return {
        "platform": "YouTube",
        "external_content_id": video_id,
        "content_title": snippet.get(
            "title",
            "Untitled YouTube Video"
        ),

        "views": int(statistics.get("viewCount", 0)),
        "likes": int(statistics.get("likeCount", 0)),
        "comments": int(statistics.get("commentCount", 0)),

        # Not provided by the YouTube Data API statistics endpoint
        "shares": 0,
        "saves": 0,
        "watch_time": 0,
        "reach": 0,

        "published_date": published_at[:10]
    }