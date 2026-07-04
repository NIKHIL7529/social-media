from datetime import datetime, timezone

from bson import ObjectId
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field

from app.core.database import get_database
from app.core.security import get_current_user
from app.schemas.common import serialize_doc
from app.services.cloudinary_service import upload_image

router = APIRouter()


class FeedPayload(BaseModel):
    cursor: str | None = None
    limit: int = Field(default=10, ge=1, le=25)


class AddPostPayload(BaseModel):
    topic: str = ""
    text: str = ""
    photo: str
    commentable: bool = True


class PostIdPayload(BaseModel):
    id: str = Field(alias="_id")


class CommentPayload(BaseModel):
    id: str = Field(alias="_id")
    comment: str = Field(min_length=1, max_length=1000)


async def hydrate_posts(posts: list[dict]) -> list[dict]:
    if not posts:
        return []
    db = get_database()
    user_ids = [post["user"] for post in posts if ObjectId.is_valid(str(post.get("user")))]
    users = await db.users.find({"_id": {"$in": user_ids}}, {"password": 0}).to_list(length=len(user_ids))
    user_map = {str(user["_id"]): user for user in users}
    for post in posts:
        post["user"] = user_map.get(str(post.get("user")))
    return [post for post in posts if post.get("user")]


@router.post("")
@router.post("/", include_in_schema=False)
async def all_posts(payload: FeedPayload) -> dict:
    query = {}
    if payload.cursor:
        if not ObjectId.is_valid(payload.cursor):
            raise HTTPException(status_code=400, detail="Invalid feed cursor")
        query["_id"] = {"$lt": ObjectId(payload.cursor)}

    docs = (
        await get_database()
        .posts.find(query)
        .sort("_id", -1)
        .limit(payload.limit + 1)
        .to_list(length=payload.limit + 1)
    )
    has_more = len(docs) > payload.limit
    page = await hydrate_posts(docs[: payload.limit])
    return {
        "status": 200,
        "message": "All Posts",
        "post": serialize_doc(page),
        "pagination": {
            "hasMore": has_more,
            "nextCursor": str(page[-1]["_id"]) if has_more and page else None,
        },
    }


@router.post("/addPost")
async def add_post(payload: AddPostPayload, current_user: dict = Depends(get_current_user)) -> dict:
    image = await upload_image(payload.photo, "postImages")
    now = datetime.now(timezone.utc)
    post = {
        "topic": payload.topic,
        "text": payload.text,
        "photo": image,
        "commentable": payload.commentable,
        "likes": 0,
        "saved": 0,
        "share": 0,
        "comments": [],
        "user": current_user["_id"],
        "createdAt": now,
        "updatedAt": now,
    }
    result = await get_database().posts.insert_one(post)
    post["_id"] = result.inserted_id
    return {"status": 200, "message": "Post added", "post": serialize_doc(post)}


@router.post("/deletePost")
async def delete_post(payload: PostIdPayload, current_user: dict = Depends(get_current_user)) -> dict:
    if not ObjectId.is_valid(payload.id):
        raise HTTPException(status_code=400, detail="Invalid post id")
    post_id = ObjectId(payload.id)
    db = get_database()
    result = await db.posts.delete_one({"_id": post_id, "user": current_user["_id"]})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Post not found")
    await db.users.update_many(
        {"$or": [{"saved": post_id}, {"liked": post_id}]},
        {"$pull": {"saved": post_id, "liked": post_id}},
    )
    return {"status": 200, "message": "Post Deleted"}


@router.get("/signedUserPosts")
async def signed_user_posts(current_user: dict = Depends(get_current_user)) -> dict:
    posts = await get_database().posts.find({"user": current_user["_id"]}).sort("_id", -1).to_list(length=200)
    hydrated = await hydrate_posts(posts)
    return {"status": 200, "message": "Signed User Posts", "post": serialize_doc(hydrated)}


@router.get("/savedPosts")
async def saved_posts(current_user: dict = Depends(get_current_user)) -> dict:
    saved_ids = current_user.get("saved", [])
    posts = await get_database().posts.find({"_id": {"$in": saved_ids}}).to_list(length=200)
    hydrated = await hydrate_posts(posts)
    return {"status": 200, "message": "Saved Posts", "post": serialize_doc(hydrated)}


@router.post("/userPosts")
async def user_posts(payload: PostIdPayload) -> dict:
    if not ObjectId.is_valid(payload.id):
        raise HTTPException(status_code=400, detail="Invalid user id")
    posts = await get_database().posts.find({"user": ObjectId(payload.id)}).sort("_id", -1).to_list(length=200)
    hydrated = await hydrate_posts(posts)
    return {"status": 200, "message": "User Posts", "post": serialize_doc(hydrated)}


@router.post("/saved")
async def saved(payload: PostIdPayload, current_user: dict = Depends(get_current_user)) -> dict:
    if not ObjectId.is_valid(payload.id):
        raise HTTPException(status_code=400, detail="Invalid post id")
    post_id = ObjectId(payload.id)
    db = get_database()
    is_saved = post_id in current_user.get("saved", [])
    if is_saved:
        await db.posts.update_one({"_id": post_id}, {"$inc": {"saved": -1}})
        await db.users.update_one({"_id": current_user["_id"]}, {"$pull": {"saved": post_id}})
        message = "Post unsaved"
    else:
        await db.posts.update_one({"_id": post_id}, {"$inc": {"saved": 1}})
        await db.users.update_one({"_id": current_user["_id"]}, {"$addToSet": {"saved": post_id}})
        message = "Post saved"
    return {"status": 200, "message": message}


@router.post("/liked")
async def liked(payload: PostIdPayload, current_user: dict = Depends(get_current_user)) -> dict:
    if not ObjectId.is_valid(payload.id):
        raise HTTPException(status_code=400, detail="Invalid post id")
    post_id = ObjectId(payload.id)
    db = get_database()
    is_liked = post_id in current_user.get("liked", [])
    if is_liked:
        await db.posts.update_one({"_id": post_id}, {"$inc": {"likes": -1}})
        await db.users.update_one({"_id": current_user["_id"]}, {"$pull": {"liked": post_id}})
        message = "Post unliked"
    else:
        await db.posts.update_one({"_id": post_id}, {"$inc": {"likes": 1}})
        await db.users.update_one({"_id": current_user["_id"]}, {"$addToSet": {"liked": post_id}})
        message = "Post liked"
    post = await db.posts.find_one({"_id": post_id}, {"likes": 1})
    return {"status": 200, "message": message, "likes": post.get("likes", 0)}


@router.post("/likedBy")
async def liked_by(payload: PostIdPayload) -> dict:
    if not ObjectId.is_valid(payload.id):
        raise HTTPException(status_code=400, detail="Invalid post id")
    post_id = ObjectId(payload.id)
    users = await get_database().users.find(
        {"liked": post_id},
        {"name": 1, "photo": 1},
    ).to_list(length=500)
    return {"status": 200, "users": serialize_doc(users)}


@router.post("/comment")
async def add_comment(payload: CommentPayload, current_user: dict = Depends(get_current_user)) -> dict:
    if not ObjectId.is_valid(payload.id):
        raise HTTPException(status_code=400, detail="Invalid post id")
    comment = {
        "_id": ObjectId(),
        "sender": current_user["name"],
        "comment": payload.comment.strip(),
        "createdAt": datetime.now(timezone.utc),
    }
    result = await get_database().posts.update_one(
        {"_id": ObjectId(payload.id), "commentable": True},
        {"$push": {"comments": comment}},
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Post not found or comments disabled")
    return {"status": 200, "message": "Comment added", "comment": serialize_doc(comment)}


@router.post("/comments")
async def comments(payload: PostIdPayload) -> dict:
    if not ObjectId.is_valid(payload.id):
        raise HTTPException(status_code=400, detail="Invalid post id")
    post = await get_database().posts.find_one({"_id": ObjectId(payload.id)}, {"comments": 1})
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    return {"status": 200, "comments": serialize_doc(post.get("comments", []))}
