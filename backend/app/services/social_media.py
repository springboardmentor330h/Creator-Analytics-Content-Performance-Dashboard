MOCK_PLATFORM_DATA = {

    "YouTube": [
        {
            "platform": "YouTube",
            "content_title": "Python Tutorial",
            "views": 15000,
            "likes": 1200,
            "comments": 150,
            "shares": 100,
            "reach": 18000
        }
    ],

    "Instagram": [
        {
            "platform": "Instagram",
            "content_title": "Python Tips",
            "views": 10000,
            "likes": 1800,
            "comments": 220,
            "shares": 150,
            "reach": 14000
        }
    ],

    "LinkedIn": [
        {
            "platform": "LinkedIn",
            "content_title": "Data Analytics Guide",
            "views": 8000,
            "likes": 600,
            "comments": 80,
            "shares": 50,
            "reach": 10000
        }
    ]

}


def get_platform_data(platform: str):
    return MOCK_PLATFORM_DATA.get(platform, [])


def sync_platform_data(platform: str):
    return get_platform_data(platform)