from bson import ObjectId

from app.core.database import get_database


async def hydrate_posts(posts: list[dict]) -> list[dict]:
    if not posts:
        return []

    db = get_database()
    user_ids = [post["user"] for post in posts if ObjectId.is_valid(str(post.get("user")))]
    users = await db.users.find({"_id": {"$in": user_ids}}, {"password": 0, "email": 0}).to_list(length=len(user_ids))
    user_map = {str(user["_id"]): user for user in users}

    hydrated = []
    for post in posts:
        post["user"] = user_map.get(str(post.get("user")))
        if not post.get("user"):
            continue
        post.setdefault("commentCount", len(post.get("comments", [])))
        post.pop("comments", None)
        hydrated.append(post)

    return hydrated
