from datetime import datetime, timezone

from bson import ObjectId
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from pymongo import ReturnDocument

from app.core.database import get_database
from app.core.security import get_current_user
from app.schemas.common import serialize_doc

router = APIRouter()
MAX_PAGE_SIZE = 100


class SendMessagePayload(BaseModel):
    receiver: list[str] = Field(default_factory=list)
    msg: str = ""
    id: str | None = Field(default=None, alias="_id")


class MessagesPayload(BaseModel):
    id: str = Field(alias="_id")
    before: str | None = None
    limit: int = Field(default=50, ge=1, le=MAX_PAGE_SIZE)


class MarkReadPayload(BaseModel):
    id: str = Field(alias="_id")


class DirectConversationPayload(BaseModel):
    userName: str


def participant_key(users: list[str]) -> str:
    return ":".join(sorted(set(users)))


async def get_conversation_for_user(conversation_id: str, user_name: str) -> dict | None:
    if not ObjectId.is_valid(conversation_id):
        return None
    return await get_database().messages.find_one({"_id": ObjectId(conversation_id), "users": user_name})


@router.get("/allChats")
async def all_chats(current_user: dict = Depends(get_current_user)) -> dict:
    db = get_database()
    user_name = current_user["name"]
    conversations = await db.messages.find(
        {"users": user_name, "group": False},
        {"users": 1, "updatedAt": 1, "lastMessage": 1, "readBy": 1},
    ).sort("updatedAt", -1).to_list(length=500)
    groups = await db.groups.find({"users": user_name}).sort("updatedAt", -1).to_list(length=500)
    group_chat_ids = [group["chatId"] for group in groups if group.get("chatId")]
    group_conversations = await db.messages.find(
        {"_id": {"$in": group_chat_ids}},
        {"updatedAt": 1, "lastMessage": 1, "readBy": 1},
    ).to_list(length=len(group_chat_ids))
    group_conversation_map = {str(conversation["_id"]): conversation for conversation in group_conversations}

    async def unread_count(conversation: dict) -> int:
        read_by = conversation.get("readBy", {})
        last_read_at = read_by.get(user_name)
        query = {"conversation": conversation["_id"], "sender": {"$ne": user_name}}
        if last_read_at:
            query["createdAt"] = {"$gt": last_read_at}
        return await db.chatmessages.count_documents(query)

    direct_chats = []
    for conversation in conversations:
        direct_chats.append({
            "chatId": conversation["_id"],
            "users": [name for name in conversation.get("users", []) if name != user_name],
            "updatedAt": conversation.get("updatedAt"),
            "lastMessage": conversation.get("lastMessage"),
            "group": False,
            "unreadCount": await unread_count(conversation),
        })

    group_chats = []
    for group in groups:
        conversation = group_conversation_map.get(str(group.get("chatId")))
        group_chats.append(
            {
                **group,
                "updatedAt": conversation.get("updatedAt") if conversation else group.get("updatedAt"),
                "lastMessage": conversation.get("lastMessage") if conversation else None,
                "unreadCount": await unread_count(conversation) if conversation else 0,
                "group": True,
            }
        )

    chats = sorted(
        [*direct_chats, *group_chats],
        key=lambda chat: chat.get("updatedAt") or datetime.min.replace(tzinfo=timezone.utc),
        reverse=True,
    )
    return {"status": 200, "message": "Chats", "chats": serialize_doc(chats), "user": user_name}


@router.post("/sendMessage")
async def send_message(payload: SendMessagePayload, current_user: dict = Depends(get_current_user)) -> dict:
    db = get_database()
    sender = current_user["name"]
    text = payload.msg.strip()
    if not text:
        raise HTTPException(status_code=400, detail="Message is required")

    conversation = None
    if payload.id:
        conversation = await get_conversation_for_user(payload.id, sender)
        if not conversation:
            raise HTTPException(status_code=404, detail="Conversation not found")
    else:
        users = list(dict.fromkeys([sender, *payload.receiver]))
        if len(users) != 2:
            raise HTTPException(status_code=400, detail="A direct conversation requires one recipient")
        key = participant_key(users)
        conversation = await db.messages.find_one({"group": False, "users": {"$all": users, "$size": len(users)}})
        if not conversation:
            result = await db.messages.find_one_and_update(
                {"participantKey": key},
                {
                    "$setOnInsert": {
                        "users": users,
                        "participantKey": key,
                        "group": False,
                        "messages": [],
                        "readBy": {sender: datetime.now(timezone.utc)},
                        "createdAt": datetime.now(timezone.utc),
                    }
                },
                upsert=True,
                return_document=ReturnDocument.AFTER,
            )
            conversation = result

    now = datetime.now(timezone.utc)
    chat_message = {
        "conversation": conversation["_id"],
        "sender": sender,
        "message": text,
        "type": "text",
        "createdAt": now,
        "updatedAt": now,
    }
    result = await db.chatmessages.insert_one(chat_message)
    chat_message["_id"] = result.inserted_id
    await db.messages.update_one(
        {"_id": conversation["_id"]},
        {
            "$set": {
                "lastMessage": {"message": text, "sender": sender, "createdAt": now},
                "updatedAt": now,
            }
        },
    )
    return {
        "status": 200,
        "statusMessage": "Message Added",
        "conversationId": str(conversation["_id"]),
        "recipients": [name for name in conversation["users"] if name != sender],
        "chatMessage": serialize_doc(chat_message),
        "message": {"messages": [serialize_doc(chat_message)]},
    }


@router.post("/markRead")
async def mark_read(payload: MarkReadPayload, current_user: dict = Depends(get_current_user)) -> dict:
    if not ObjectId.is_valid(payload.id):
        raise HTTPException(status_code=400, detail="Invalid conversation id")
    result = await get_database().messages.update_one(
        {"_id": ObjectId(payload.id), "users": current_user["name"]},
        {"$set": {f"readBy.{current_user['name']}": datetime.now(timezone.utc)}},
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Conversation not found")
    return {"status": 200, "message": "Conversation marked as read"}


@router.post("/direct")
async def direct_conversation(
    payload: DirectConversationPayload,
    current_user: dict = Depends(get_current_user),
) -> dict:
    db = get_database()
    target = await db.users.find_one({"name": payload.userName}, {"name": 1})
    if not target:
        raise HTTPException(status_code=404, detail="User not found")
    if target["name"] == current_user["name"]:
        raise HTTPException(status_code=400, detail="Cannot start a chat with yourself")

    users = [current_user["name"], target["name"]]
    key = participant_key(users)
    now = datetime.now(timezone.utc)
    conversation = await db.messages.find_one_and_update(
        {"participantKey": key},
        {
            "$setOnInsert": {
                "users": users,
                "participantKey": key,
                "group": False,
                "messages": [],
                "readBy": {current_user["name"]: now},
                "createdAt": now,
                "updatedAt": now,
            }
        },
        upsert=True,
        return_document=ReturnDocument.AFTER,
    )
    return {
        "status": 200,
        "message": "Direct conversation",
        "chat": serialize_doc(
            {
                "chatId": conversation["_id"],
                "users": [name for name in conversation["users"] if name != current_user["name"]],
                "updatedAt": conversation.get("updatedAt"),
                "lastMessage": conversation.get("lastMessage"),
                "group": False,
                "unreadCount": 0,
            }
        ),
    }


@router.post("/messages")
async def messages(payload: MessagesPayload, current_user: dict = Depends(get_current_user)) -> dict:
    db = get_database()
    conversation = await get_conversation_for_user(payload.id, current_user["name"])
    if not conversation:
        raise HTTPException(status_code=404, detail="Conversation not found")

    legacy_cursor = None
    if payload.before and payload.before.startswith("legacy:"):
        legacy_cursor = int(payload.before.split(":", 1)[1])

    current_messages = []
    if legacy_cursor is None:
        query: dict = {"conversation": conversation["_id"]}
        if payload.before:
            try:
                query["createdAt"] = {"$lt": datetime.fromisoformat(payload.before.replace("Z", "+00:00"))}
            except ValueError:
                pass
        current_messages = await db.chatmessages.find(query).sort("createdAt", -1).limit(payload.limit + 1).to_list(length=payload.limit + 1)

    has_more_current = len(current_messages) > payload.limit
    page = list(reversed(current_messages[: payload.limit]))
    legacy_messages = conversation.get("messages", [])
    legacy_end = len(legacy_messages) if legacy_cursor is None else min(max(legacy_cursor, 0), len(legacy_messages))
    remaining = payload.limit - len(page)
    legacy_start = max(0, legacy_end - remaining)
    legacy_page = []
    if not has_more_current and remaining > 0:
        legacy_page = [
            {**message, "conversation": conversation["_id"]}
            for message in legacy_messages[legacy_start:legacy_end]
        ]

    combined = [*legacy_page, *page]
    has_more_legacy = not has_more_current and legacy_start > 0
    next_cursor = page[0].get("createdAt") if has_more_current and page else (f"legacy:{legacy_start}" if has_more_legacy else None)

    return {
        "status": 200,
        "message": "Messages",
        "messages": {"_id": str(conversation["_id"]), "messages": serialize_doc(combined)},
        "pagination": {"hasMore": has_more_current or has_more_legacy, "nextCursor": serialize_doc(next_cursor)},
    }


@router.get("/followings")
async def followings(current_user: dict = Depends(get_current_user)) -> dict:
    user = await get_database().users.find_one({"_id": current_user["_id"]}, {"followings": 1})
    return {"status": 200, "message": "Followings", "followings": serialize_doc([user] if user else [])}
