from fastapi import HTTPException
from pymongo import ReturnDocument

from app.core.database import get_database
from app.core.validation import object_id_or_400
from app.domains.notifications import create_notification
from app.schemas.common import serialize_doc


async def _toggle_user_post_set(
    user_id,
    field: str,
    post_id,
) -> tuple[bool, int]:
    db = get_database()
    removed = await db.users.update_one({"_id": user_id, field: post_id}, {"$pull": {field: post_id}})
    if removed.modified_count:
        return False, -1

    added = await db.users.update_one({"_id": user_id, field: {"$ne": post_id}}, {"$addToSet": {field: post_id}})
    if added.modified_count:
        return True, 1

    user = await db.users.find_one({"_id": user_id}, {field: 1})
    return post_id in (user or {}).get(field, []), 0


async def _update_post_counter(post_id, field: str, delta: int) -> int:
    db = get_database()
    post = await db.posts.find_one_and_update(
        {"_id": post_id},
        {"$inc": {field: delta}},
        projection={field: 1},
        return_document=ReturnDocument.AFTER,
    )
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    if post.get(field, 0) < 0:
        await db.posts.update_one({"_id": post_id}, {"$set": {field: 0}})
        return 0
    return post.get(field, 0)


async def toggle_saved(post_id_value: str, current_user: dict) -> dict:
    post_id = object_id_or_400(post_id_value, "Invalid post id")
    db = get_database()
    if not await db.posts.find_one({"_id": post_id}, {"_id": 1}):
        raise HTTPException(status_code=404, detail="Post not found")

    saved, delta = await _toggle_user_post_set(current_user["_id"], "saved", post_id)
    saved_count = await _update_post_counter(post_id, "saved", delta) if delta else (await db.posts.find_one({"_id": post_id}, {"saved": 1})).get("saved", 0)
    return {
        "status": 200,
        "message": "Post saved" if saved else "Post unsaved",
        "saved": saved,
        "savedCount": saved_count,
    }


async def toggle_liked(post_id_value: str, current_user: dict) -> dict:
    post_id = object_id_or_400(post_id_value, "Invalid post id")
    db = get_database()
    if not await db.posts.find_one({"_id": post_id}, {"_id": 1}):
        raise HTTPException(status_code=404, detail="Post not found")

    liked, delta = await _toggle_user_post_set(current_user["_id"], "liked", post_id)
    likes = await _update_post_counter(post_id, "likes", delta) if delta else (await db.posts.find_one({"_id": post_id}, {"likes": 1})).get("likes", 0)
    if liked:
        post = await db.posts.find_one({"_id": post_id}, {"user": 1})
        owner = await db.users.find_one({"_id": post["user"]}, {"name": 1}) if post else None
        await create_notification(
            recipient=owner.get("name", "") if owner else "",
            actor=current_user["name"],
            notification_type="like",
            entity_id=str(post_id),
            text=f"{current_user['name']} liked your post",
        )
    return {
        "status": 200,
        "message": "Post liked" if liked else "Post unliked",
        "liked": liked,
        "likes": likes,
    }


async def list_liked_by(post_id_value: str) -> dict:
    post_id = object_id_or_400(post_id_value, "Invalid post id")
    users = await get_database().users.find(
        {"liked": post_id},
        {"name": 1, "username": 1, "photo": 1},
    ).to_list(length=500)
    return {"status": 200, "users": serialize_doc(users)}


async def share_post(post_id_value: str) -> dict:
    post_id = object_id_or_400(post_id_value, "Invalid post id")
    post = await get_database().posts.find_one_and_update(
        {"_id": post_id},
        {"$inc": {"share": 1}},
        projection={"share": 1},
        return_document=ReturnDocument.AFTER,
    )
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    return {"status": 200, "share": post.get("share", 0)}
