from app.core.database import get_database


async def attach_post_authors(posts: list[dict]) -> list[dict]:
    """Attach public author documents with one query for the entire post batch."""
    if not posts:
        return []

    user_ids = list({post["user"] for post in posts})
    users = await get_database().users.find(
        {"_id": {"$in": user_ids}}, {"password": 0, "email": 0},
    ).to_list(length=len(user_ids))
    authors = {user["_id"]: user for user in users}

    return [
        {**post, "user": authors[post["user"]]}
        for post in posts
        if post["user"] in authors
    ]
