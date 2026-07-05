from fastapi import HTTPException

from app.core.database import get_database
from app.core.time import utc_now
from app.core.validation import object_id_or_400
from app.domains.media.cloudinary import delete_image, upload_image
from app.domains.posts.hydration import hydrate_posts
from app.schemas.common import serialize_doc


async def create_post(payload: dict, current_user: dict) -> dict:
    image = await upload_image(payload["photo"], "postImages")
    now = utc_now()
    post = {
        "topic": payload.get("topic", ""),
        "text": payload.get("text", ""),
        "photo": image,
        "commentable": payload.get("commentable", True),
        "likes": 0,
        "saved": 0,
        "share": 0,
        "commentCount": 0,
        "user": current_user["_id"],
        "createdAt": now,
        "updatedAt": now,
    }
    result = await get_database().posts.insert_one(post)
    post["_id"] = result.inserted_id
    hydrated = await hydrate_posts([post])
    return {"status": 200, "message": "Post added", "post": serialize_doc(hydrated[0] if hydrated else post)}


async def delete_post(post_id_value: str, current_user: dict) -> dict:
    post_id = object_id_or_400(post_id_value, "Invalid post id")
    db = get_database()
    post = await db.posts.find_one({"_id": post_id, "user": current_user["_id"]}, {"photo": 1})
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    result = await db.posts.delete_one({"_id": post_id, "user": current_user["_id"]})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Post not found")
    await db.users.update_many(
        {"$or": [{"saved": post_id}, {"liked": post_id}]},
        {"$pull": {"saved": post_id, "liked": post_id}},
    )
    await db.comments.delete_many({"post": post_id})
    await delete_image(post.get("photo", ""))
    return {"status": 200, "message": "Post Deleted"}
