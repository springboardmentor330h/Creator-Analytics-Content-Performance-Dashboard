"""
Common API response helper functions.
"""


def success_response(
    message: str,
    data=None
):
    """
    Create a standard successful response.
    """

    return {
        "success": True,
        "message": message,
        "data": data
    }


def error_response(
    message: str
):
    """
    Create a standard error response.
    """

    return {
        "success": False,
        "message": message
    }