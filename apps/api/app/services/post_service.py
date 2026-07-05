from bson import ObjectId
from fastapi import HTTPException
from pymongo import ReturnDocument

from app.core.database import get_database
from app.core.time import utc_now
from app.core.validation import object_id_or_400
from app.schemas.common import serialize_doc
from app.services.cloudinary_service import upload_image


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
    return {"status": 200, "message": "Post added", "post": serialize_doc(post)}


async def delete_post(post_id_value: str, current_user: dict) -> dict:
    post_id = object_id_or_400(post_id_value, "Invalid post id")
    db = get_database()
    result = await db.posts.delete_one({"_id": post_id, "user": current_user["_id"]})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Post not found")
    await db.users.update_many(
        {"$or": [{"saved": post_id}, {"liked": post_id}]},
        {"$pull": {"saved": post_id, "liked": post_id}},
    )
    await db.comments.delete_many({"post": post_id})
    return {"status": 200, "message": "Post Deleted"}


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
    return {"status": 200, "message": "Saved Posts", "post": serialize_doc(hydrated)}


async def toggle_saved(post_id_value: str, current_user: dict) -> dict:
    post_id = object_id_or_400(post_id_value, "Invalid post id")
    db = get_database()
    is_saved = post_id in current_user.get("saved", [])
    update = -1 if is_saved else 1
    user_update = {"$pull": {"saved": post_id}} if is_saved else {"$addToSet": {"saved": post_id}}

    await db.posts.update_one({"_id": post_id}, {"$inc": {"saved": update}})
    await db.users.update_one({"_id": current_user["_id"]}, user_update)
    post = await db.posts.find_one({"_id": post_id}, {"saved": 1})

    return {
        "status": 200,
        "message": "Post unsaved" if is_saved else "Post saved",
        "saved": not is_saved,
        "savedCount": post.get("saved", 0) if post else 0,
    }


async def toggle_liked(post_id_value: str, current_user: dict) -> dict:
    post_id = object_id_or_400(post_id_value, "Invalid post id")
    db = get_database()
    is_liked = post_id in current_user.get("liked", [])
    update = -1 if is_liked else 1
    user_update = {"$pull": {"liked": post_id}} if is_liked else {"$addToSet": {"liked": post_id}}

    await db.posts.update_one({"_id": post_id}, {"$inc": {"likes": update}})
    await db.users.update_one({"_id": current_user["_id"]}, user_update)
    post = await db.posts.find_one({"_id": post_id}, {"likes": 1})

    return {
        "status": 200,
        "message": "Post unliked" if is_liked else "Post liked",
        "liked": not is_liked,
        "likes": post.get("likes", 0) if post else 0,
    }


async def list_liked_by(post_id_value: str) -> dict:
    post_id = object_id_or_400(post_id_value, "Invalid post id")
    users = await get_database().users.find(
        {"liked": post_id},
        {"name": 1, "username": 1, "photo": 1},
    ).to_list(length=500)
    return {"status": 200, "users": serialize_doc(users)}


async def create_comment(post_id_value: str, text: str, current_user: dict) -> dict:
    post_id = object_id_or_400(post_id_value, "Invalid post id")
    now = utc_now()
    comment = {
        "_id": ObjectId(),
        "post": post_id,
        "sender": current_user["name"],
        "comment": text.strip(),
        "status": "visible",
        "createdAt": now,
        "updatedAt": now,
    }
    db = get_database()
    result = await db.posts.update_one(
        {"_id": post_id, "commentable": True},
        {"$inc": {"commentCount": 1}, "$set": {"updatedAt": now}},
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Post not found or comments disabled")
    await db.comments.insert_one(comment)
    return {"status": 200, "message": "Comment added", "comment": serialize_doc(comment)}


async def list_comments(post_id_value: str) -> dict:
    post_id = object_id_or_400(post_id_value, "Invalid post id")
    db = get_database()
    post = await db.posts.find_one({"_id": post_id}, {"_id": 1})
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")

    comment_docs = await db.comments.find(
        {"post": post_id, "status": "visible"},
        {"post": 0},
    ).sort("createdAt", 1).limit(200).to_list(length=200)
    if not comment_docs:
        legacy = await db.posts.find_one({"_id": post_id}, {"comments": 1})
        comment_docs = legacy.get("comments", []) if legacy else []
    return {"status": 200, "comments": serialize_doc(comment_docs)}


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
