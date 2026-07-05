from fastapi import APIRouter, Depends

from app.core.security import get_current_user
from app.domains.chat import (
    DirectConversationPayload,
    get_direct_conversation,
    list_chats,
    list_followings,
    list_messages,
    MarkReadPayload,
    MessagesPayload,
    mark_read as mark_read_service,
    SendMessagePayload,
    send_message as send_message_service,
)

router = APIRouter()


@router.get("/allChats")
async def all_chats(current_user: dict = Depends(get_current_user)) -> dict:
    return await list_chats(current_user)


@router.post("/sendMessage")
async def send_message(payload: SendMessagePayload, current_user: dict = Depends(get_current_user)) -> dict:
    return await send_message_service(payload.receiver, payload.msg, payload.id, current_user)


@router.post("/markRead")
async def mark_read(payload: MarkReadPayload, current_user: dict = Depends(get_current_user)) -> dict:
    return await mark_read_service(payload.id, current_user)


@router.post("/direct")
async def direct_conversation(
    payload: DirectConversationPayload,
    current_user: dict = Depends(get_current_user),
) -> dict:
    return await get_direct_conversation(payload.userName, current_user)


@router.post("/messages")
async def messages(payload: MessagesPayload, current_user: dict = Depends(get_current_user)) -> dict:
    return await list_messages(payload.id, payload.before, payload.limit, current_user)


@router.get("/followings")
async def followings(current_user: dict = Depends(get_current_user)) -> dict:
    return await list_followings(current_user)
