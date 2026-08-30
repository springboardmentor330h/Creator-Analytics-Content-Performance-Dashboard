# ============================================================
# SOCIAL MEDIA SERVICE
# ============================================================
#
# This service:
# - Normalizes platform names
# - Keeps track of connected accounts per creator
# - Does NOT contain mock content data
# - Does NOT create Content records
#
# Actual content synchronization is handled by the router
# and the real platform service, e.g. YouTube.
# ============================================================


# ============================================================
# CANONICAL PLATFORM NAMES
# ============================================================

SUPPORTED_PLATFORMS = [
    "YouTube",
    "Instagram",
    "Facebook",
    "LinkedIn",
    "TikTok",
    "Twitter",
]


# ============================================================
# PLATFORM ALIASES
# ============================================================

PLATFORM_ALIASES = {
    "youtube": "YouTube",
    "yt": "YouTube",

    "instagram": "Instagram",
    "ig": "Instagram",
    "insta": "Instagram",

    "facebook": "Facebook",
    "fb": "Facebook",

    "linkedin": "LinkedIn",

    "tiktok": "TikTok",
    "tt": "TikTok",

    "twitter": "Twitter",
    "x": "Twitter",
    "tweet": "Twitter",
}


# ============================================================
# CONNECTED PLATFORMS
# ============================================================
#
# Structure:
#
# {
#     creator_id: {
#         "YouTube": "my_channel",
#         "Instagram": "my_instagram"
#     }
# }
#
# Example:
#
# {
#     2: {
#         "YouTube": "Creator A",
#         "Instagram": "creator_a"
#     },
#     3: {
#         "YouTube": "Creator B"
#     }
# }
#
# This prevents Creator 2 and Creator 3 from sharing
# the same connected-platform state.
#
# IMPORTANT:
# This is still in-memory storage.
# Restarting FastAPI will clear these connections.
#
# For permanent storage, create a SocialAccount database
# model/table later.
# ============================================================

connected_platforms: dict[int, dict[str, str]] = {}


# ============================================================
# NORMALIZE PLATFORM
# ============================================================

def normalize_platform(platform: str | None) -> str | None:
    """
    Convert platform input into a canonical platform name.

    Examples:

        youtube   -> YouTube
        YouTube   -> YouTube
        yt        -> YouTube
        instagram -> Instagram
        ig        -> Instagram
        x         -> Twitter
        twitter   -> Twitter

    Returns None when the platform is unsupported.
    """

    if not platform:
        return None

    key = platform.strip().lower()

    return PLATFORM_ALIASES.get(key)


# ============================================================
# CHECK SUPPORTED PLATFORM
# ============================================================

def is_supported_platform(
    platform: str | None,
) -> bool:
    """
    Return True when the platform is supported.
    """

    canonical = normalize_platform(platform)

    return canonical is not None


# ============================================================
# CONNECT PLATFORM
# ============================================================

def connect_platform(
    creator_id: int,
    platform: str,
    account_name: str,
):
    """
    Connect a platform for a specific creator.

    creator_id comes from the authenticated user.

    The frontend must NOT be trusted to provide creator_id.
    """

    # --------------------------------------------------------
    # VALIDATE CREATOR ID
    # --------------------------------------------------------

    if creator_id <= 0:
        return None

    # --------------------------------------------------------
    # NORMALIZE PLATFORM
    # --------------------------------------------------------

    canonical = normalize_platform(platform)

    if not canonical:
        return None

    # --------------------------------------------------------
    # VALIDATE ACCOUNT NAME
    # --------------------------------------------------------

    if not account_name or not account_name.strip():
        return None

    account_name = account_name.strip()

    # --------------------------------------------------------
    # CREATE CREATOR ENTRY
    # --------------------------------------------------------

    if creator_id not in connected_platforms:
        connected_platforms[creator_id] = {}

    # --------------------------------------------------------
    # SAVE / UPDATE CONNECTION
    # --------------------------------------------------------

    connected_platforms[creator_id][canonical] = account_name

    # --------------------------------------------------------
    # RETURN CONNECTION
    # --------------------------------------------------------

    return {
        "creator_id": creator_id,
        "platform": canonical,
        "account_name": account_name,
    }


# ============================================================
# GET CONNECTED PLATFORMS
# ============================================================

def get_connected_platforms(
    creator_id: int,
):
    """
    Return connected platforms for one creator.

    This does NOT return another creator's connections.
    """

    creator_connections = connected_platforms.get(
        creator_id,
        {},
    )

    return {
        "creator_id": creator_id,
        "platforms": list(
            creator_connections.keys()
        ),
        "accounts": [
            {
                "platform": platform,
                "account_name": account_name,
            }
            for platform, account_name
            in creator_connections.items()
        ],
        "supported_platforms": list(
            SUPPORTED_PLATFORMS
        ),
    }


# ============================================================
# GET CONNECTED ACCOUNT
# ============================================================

def get_connected_account(
    creator_id: int,
    platform: str,
):
    """
    Get the connected account for a creator/platform.
    """

    canonical = normalize_platform(platform)

    if not canonical:
        return None

    creator_connections = connected_platforms.get(
        creator_id,
        {},
    )

    account_name = creator_connections.get(
        canonical
    )

    if not account_name:
        return None

    return {
        "creator_id": creator_id,
        "platform": canonical,
        "account_name": account_name,
    }


# ============================================================
# CHECK PLATFORM CONNECTION
# ============================================================

def is_platform_connected(
    creator_id: int,
    platform: str,
) -> bool:
    """
    Check whether a specific creator has connected
    a specific platform.
    """

    canonical = normalize_platform(platform)

    if not canonical:
        return False

    creator_connections = connected_platforms.get(
        creator_id,
        {},
    )

    return canonical in creator_connections


# ============================================================
# DISCONNECT PLATFORM
# ============================================================

def disconnect_platform(
    creator_id: int,
    platform: str,
) -> bool:
    """
    Disconnect a platform for a specific creator.
    """

    canonical = normalize_platform(platform)

    if not canonical:
        return False

    creator_connections = connected_platforms.get(
        creator_id,
        {},
    )

    if canonical not in creator_connections:
        return False

    del creator_connections[canonical]

    # Remove empty creator entry
    if not creator_connections:
        connected_platforms.pop(
            creator_id,
            None,
        )

    return True


# ============================================================
# CLEAR CREATOR CONNECTIONS
# ============================================================

def clear_creator_connections(
    creator_id: int,
) -> None:
    """
    Remove all social-platform connections
    belonging to a creator.
    """

    connected_platforms.pop(
        creator_id,
        None,
    )