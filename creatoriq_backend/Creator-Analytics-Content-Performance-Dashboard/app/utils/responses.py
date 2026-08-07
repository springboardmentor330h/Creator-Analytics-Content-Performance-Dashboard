# Response helpers placeholder
from typing import Any, Optional


def success_response(data: Any, message: str = "Success", status_code: int = 200) -> dict:
    return {
        "status": "success",
        "status_code": status_code,
        "message": message,
        "data": data,
    }


def error_response(message: str, status_code: int = 400, errors: Optional[Any] = None) -> dict:
    return {
        "status": "error",
        "status_code": status_code,
        "message": message,
        "errors": errors,
    }