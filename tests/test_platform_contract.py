from datetime import date

from app.services.instagram_service import InstagramService


def test_instagram_metric_normalization_keeps_missing_values_unavailable():
    normalized = InstagramService._normalize_metrics(
        {
            "views": 1200,
            "reach": 8000,
            "likes": None,
            "shares": None,
            "comments": None,
        }
    )

    assert normalized["views"] == 1200
    assert normalized["reach"] == 8000
    assert normalized["likes"] is None
    assert normalized["comments"] is None
    assert normalized["shares"] is None


def test_shared_content_record_has_required_shape_for_platform_data():
    record = InstagramService.transform_media_item(
        {
            "id": "ig_123",
            "caption": "Launch week reel",
            "timestamp": "2026-08-31T12:00:00+00:00",
            "insights": {"data": [{"name": "reach", "total": 5000}, {"name": "views", "total": 2400}]},
        },
        account_id="abc123",
    )

    assert record["platform"] == "Instagram"
    assert record["content_id"] == "ig_123"
    assert record["content_title"] == "Launch week reel"
    assert record["views"] == 2400
    assert record["likes"] is None
    assert record["comments"] is None
    assert record["shares"] is None
    assert record["reach"] == 5000
    assert record["published_date"] == date(2026, 8, 31)
