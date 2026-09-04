from fastapi import APIRouter, Query
from typing import Optional

router = APIRouter()

@router.get("")
def list_content(platform: Optional[str] = Query(None)):
    return []
