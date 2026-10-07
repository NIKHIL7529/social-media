from bson import ObjectId
from fastapi import HTTPException

from app.core.database import get_database
from app.core.time import utc_now
from app.core.validation import object_id_or_400
from app.schemas.common import serialize_doc


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
    post = await db.posts.find_one({"_id": post_id}, {"commentCount": 1})
    return {
        "status": 200,
        "message": "Comment added",
        "comment": serialize_doc(comment),
        "commentCount": post.get("commentCount", 0) if post else 0,
    }


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
