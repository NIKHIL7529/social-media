from app.core.database import get_database
from app.core.validation import object_id_or_400
from app.domains.posts.hydration import hydrate_posts
from app.schemas.common import serialize_doc


async def list_feed(cursor: str | None, limit: int) -> dict:
    query = {}
    if cursor:
        query["_id"] = {"$lt": object_id_or_400(cursor, "Invalid feed cursor")}

    docs = await get_database().posts.find(query).sort("_id", -1).limit(limit + 1).to_list(length=limit + 1)
    has_more = len(docs) > limit
    page = await hydrate_posts(docs[:limit])
    return {
        "status": 200,
        "message": "All Posts",
        "post": serialize_doc(page),
        "pagination": {
            "hasMore": has_more,
            "nextCursor": str(page[-1]["_id"]) if has_more and page else None,
        },
    }


async def list_posts_for_user(user_id_value: str) -> dict:
    user_id = object_id_or_400(user_id_value, "Invalid user id")
    posts = await get_database().posts.find({"user": user_id}).sort("_id", -1).to_list(length=200)
    hydrated = await hydrate_posts(posts)
    return {"status": 200, "message": "User Posts", "post": serialize_doc(hydrated)}


async def list_signed_user_posts(current_user: dict) -> dict:
    posts = await get_database().posts.find({"user": current_user["_id"]}).sort("_id", -1).to_list(length=200)
    hydrated = await hydrate_posts(posts)
    return {"status": 200, "message": "Signed User Posts", "post": serialize_doc(hydrated)}


async def list_saved_posts(current_user: dict) -> dict:
    saved_ids = current_user.get("saved", [])
    posts = await get_database().posts.find({"_id": {"$in": saved_ids}}).to_list(length=200)
    hydrated = await hydrate_posts(posts)
    order = {str(post_id): index for index, post_id in enumerate(saved_ids)}
    hydrated.sort(key=lambda post: order.get(str(post["_id"]), len(order)))
    return {"status": 200, "message": "Saved Posts", "post": serialize_doc(hydrated)}
