from __future__ import annotations

import logging
from datetime import date
from typing import Any, Dict, List, Optional

import requests
from fastapi import HTTPException, status
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.models.content import Content
from app.models.user import User

logger = logging.getLogger(__name__)


class InstagramService:
    BASE_URL = "https://graph.facebook.com/v19.0"

    @staticmethod
    def _safe_int(value: Any) -> Optional[int]:
        if value is None or value == "":
            return None
        if isinstance(value, bool):
            return None
        if isinstance(value, int):
            return value
        if isinstance(value, float):
            return int(value)
        if isinstance(value, str):
            cleaned = value.strip()
            if not cleaned or cleaned.lower() in {"null", "none", "n/a", "unavailable"}:
                return None
            try:
                return int(float(cleaned))
            except ValueError:
                return None
        return None

    @classmethod
    def _normalize_metrics(cls, metric_values: Dict[str, Any]) -> Dict[str, Optional[int]]:
        return {
            "views": cls._safe_int(metric_values.get("views")),
            "likes": cls._safe_int(metric_values.get("likes")),
            "comments": cls._safe_int(metric_values.get("comments")),
            "shares": cls._safe_int(metric_values.get("shares")),
            "reach": cls._safe_int(metric_values.get("reach")),
        }

    @classmethod
    def transform_media_item(cls, item: Dict[str, Any], account_id: Optional[str] = None) -> Dict[str, Any]:
        if not isinstance(item, dict):
            raise ValueError("Instagram media record must be a dictionary.")

        media_id = item.get("id") or item.get("media_id") or f"ig_{account_id}_{date.today().strftime('%Y%m%d')}"
        caption = item.get("caption") or item.get("title") or "Instagram media"
        caption = str(caption).strip() or "Instagram media"

        published_value = item.get("timestamp") or item.get("published_time") or item.get("created_time")
        if published_value:
            try:
                published_date = date.fromisoformat(str(published_value)[:10])
            except ValueError:
                published_date = date.today()
        else:
            published_date = date.today()

        insight_values = item.get("insights", {}) if isinstance(item.get("insights"), dict) else {}
        metric_map: Dict[str, Any] = {}
        for metric in insight_values.get("data", []):
            if isinstance(metric, dict):
                metric_name = str(metric.get("name") or "").lower()
                if metric_name:
                    metric_map[metric_name] = metric.get("total") if metric.get("total") is not None else metric.get("value")

        raw_metric_values = {
            "views": item.get("views") or metric_map.get("views") or item.get("media_views"),
            "likes": item.get("like_count") or metric_map.get("likes") or item.get("likes"),
            "comments": item.get("comments_count") or metric_map.get("comments") or item.get("comments"),
            "shares": item.get("shares_count") or item.get("share_count") or metric_map.get("shares") or item.get("shares"),
            "reach": item.get("reach") or metric_map.get("reach") or item.get("reach_count"),
        }
        normalized = cls._normalize_metrics(raw_metric_values)

        return {
            "platform": "Instagram",
            "content_id": media_id,
            "external_content_id": media_id,
            "content_title": caption[:120],
            "views": normalized["views"],
            "likes": normalized["likes"],
            "comments": normalized["comments"],
            "shares": normalized["shares"],
            "reach": normalized["reach"],
            "published_date": published_date,
        }

    @classmethod
    def fetch_creator_media(cls, account_id: str, access_token: str, max_results: int = 10) -> List[Dict[str, Any]]:
        if not account_id or not access_token:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Instagram account_id and access_token are required.",
            )

        api_url = f"{cls.BASE_URL}/{account_id}/media"
        params = {
            "fields": "id,caption,media_type,media_url,permalink,timestamp,like_count,comments_count,insights.metric(reach,views,likes,comments,shares)",
            "access_token": access_token,
            "limit": max_results,
        }

        try:
            response = requests.get(api_url, params=params, timeout=15)
            if response.status_code in (400, 401, 403):
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Instagram API authentication failed. Check the access token and account id.",
                )
            if response.status_code == 429:
                raise HTTPException(
                    status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                    detail="Instagram API rate limit reached. Please retry later.",
                )
            response.raise_for_status()
            payload = response.json()
        except requests.RequestException as exc:
            raise HTTPException(
                status_code=status.HTTP_502_BAD_GATEWAY,
                detail=f"Failed to communicate with Instagram API: {exc}",
            ) from exc

        items = payload.get("data", [])
        if not items:
            return []

        transformed: List[Dict[str, Any]] = []
        for item in items:
            try:
                transformed.append(cls.transform_media_item(item, account_id=account_id))
            except ValueError as exc:
                logger.warning("Skipping invalid Instagram media payload: %s", exc)

        return transformed

    @classmethod
    def sync_instagram_data(
        cls,
        db: Session,
        account_id: str,
        access_token: str,
        creator_id: int = 1,
        max_results: int = 10,
    ) -> Dict[str, Any]:
        user_exists = db.query(User).filter(User.id == creator_id).first()
        if not user_exists:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Creator with ID {creator_id} does not exist in users table.",
            )

        try:
            raw_items = cls.fetch_creator_media(account_id, access_token, max_results=max_results)
        except HTTPException as exc:
            logger.warning("Instagram sync failed for creator %s: %s", creator_id, exc.detail)
            return {
                "platform": "Instagram",
                "status": "error",
                "records_synced": 0,
                "records_updated": 0,
                "total_processed": 0,
                "message": exc.detail,
            }

        synced_count = 0
        updated_count = 0
        skipped_invalid = 0

        for item in raw_items:
            content_id = item.get("content_id") or item.get("external_content_id")
            if not content_id:
                skipped_invalid += 1
                logger.warning("Ignoring Instagram record without content_id for creator %s", creator_id)
                continue

            existing_record = (
                db.query(Content)
                .filter(
                    Content.creator_id == creator_id,
                    func.lower(Content.platform) == "instagram",
                    Content.external_content_id == content_id,
                )
                .first()
            )

            values = {
                "content_title": item["content_title"],
                "views": item["views"],
                "likes": item["likes"],
                "comments": item["comments"],
                "shares": item["shares"],
                "reach": item["reach"],
                "published_date": item["published_date"],
            }

            if existing_record:
                for field_name, field_value in values.items():
                    if field_name == "content_title":
                        existing_record.content_title = field_value
                    elif field_name == "published_date":
                        existing_record.published_date = field_value
                    else:
                        setattr(existing_record, field_name, field_value if field_value is not None else getattr(existing_record, field_name))
                updated_count += 1
            else:
                new_record = Content(
                    creator_id=creator_id,
                    platform="Instagram",
                    external_content_id=content_id,
                    content_title=item["content_title"],
                    views=item["views"] if item["views"] is not None else 0,
                    likes=item["likes"] if item["likes"] is not None else 0,
                    comments=item["comments"] if item["comments"] is not None else 0,
                    shares=item["shares"] if item["shares"] is not None else 0,
                    reach=item["reach"] if item["reach"] is not None else 0,
                    published_date=item["published_date"],
                )
                db.add(new_record)
                synced_count += 1

        db.commit()

        return {
            "platform": "Instagram",
            "status": "success",
            "records_synced": synced_count,
            "records_updated": updated_count,
            "invalid_records": skipped_invalid,
            "total_processed": len(raw_items),
        }
