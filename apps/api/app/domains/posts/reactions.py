from fastapi import HTTPException
from pymongo import ReturnDocument

from app.core.database import get_database
from app.core.validation import object_id_or_400
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


async def _toggle_reaction(post_id_value: str, current_user: dict, user_field: str, counter_field: str) -> tuple[bool, int]:
    post_id = object_id_or_400(post_id_value, "Invalid post id")
    db = get_database()
    if not await db.posts.find_one({"_id": post_id}, {"_id": 1}):
        raise HTTPException(status_code=404, detail="Post not found")
    active, delta = await _toggle_user_post_set(current_user["_id"], user_field, post_id)
    if delta:
        count = await _update_post_counter(post_id, counter_field, delta)
    else:
        post = await db.posts.find_one({"_id": post_id}, {counter_field: 1})
        if not post:
            raise HTTPException(status_code=404, detail="Post not found")
        count = post.get(counter_field, 0)
    return active, count


async def toggle_saved(post_id_value: str, current_user: dict) -> dict:
    saved, saved_count = await _toggle_reaction(post_id_value, current_user, "saved", "saved")
    return {
        "status": 200,
        "message": "Post saved" if saved else "Post unsaved",
        "saved": saved,
        "savedCount": saved_count,
    }


async def toggle_liked(post_id_value: str, current_user: dict) -> dict:
    liked, likes = await _toggle_reaction(post_id_value, current_user, "liked", "likes")
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
