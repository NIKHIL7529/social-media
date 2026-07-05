from fastapi import APIRouter, Depends

from app.core.security import get_current_user
from app.domains.posts import (
    AddPostPayload,
    CommentPayload,
    create_comment,
    create_post,
    delete_post as delete_post_service,
    FeedPayload,
    list_comments,
    list_feed,
    list_liked_by,
    list_posts_for_user,
    list_saved_posts,
    list_signed_user_posts,
    PostIdPayload,
    share_post,
    toggle_liked,
    toggle_saved,
)

router = APIRouter()


@router.post("")
@router.post("/", include_in_schema=False)
async def all_posts(payload: FeedPayload) -> dict:
    return await list_feed(payload.cursor, payload.limit)


@router.post("/addPost")
async def add_post(payload: AddPostPayload, current_user: dict = Depends(get_current_user)) -> dict:
    return await create_post(payload.model_dump(), current_user)


@router.post("/deletePost")
async def delete_post(payload: PostIdPayload, current_user: dict = Depends(get_current_user)) -> dict:
    return await delete_post_service(payload.id, current_user)


@router.get("/signedUserPosts")
async def signed_user_posts(current_user: dict = Depends(get_current_user)) -> dict:
    return await list_signed_user_posts(current_user)


@router.get("/savedPosts")
async def saved_posts(current_user: dict = Depends(get_current_user)) -> dict:
    return await list_saved_posts(current_user)


@router.post("/userPosts")
async def user_posts(payload: PostIdPayload) -> dict:
    return await list_posts_for_user(payload.id)


@router.post("/saved")
async def saved(payload: PostIdPayload, current_user: dict = Depends(get_current_user)) -> dict:
    return await toggle_saved(payload.id, current_user)


@router.post("/liked")
async def liked(payload: PostIdPayload, current_user: dict = Depends(get_current_user)) -> dict:
    return await toggle_liked(payload.id, current_user)


@router.post("/likedBy")
async def liked_by(payload: PostIdPayload) -> dict:
    return await list_liked_by(payload.id)


@router.post("/comment")
async def add_comment(payload: CommentPayload, current_user: dict = Depends(get_current_user)) -> dict:
    return await create_comment(payload.id, payload.comment, current_user)


@router.post("/comments")
async def comments(payload: PostIdPayload) -> dict:
    return await list_comments(payload.id)


@router.post("/shared")
async def shared(payload: PostIdPayload) -> dict:
    return await share_post(payload.id)
