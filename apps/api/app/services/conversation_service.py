from datetime import datetime, timezone

from bson import ObjectId
from fastapi import HTTPException
from pymongo import ReturnDocument

from app.core.database import get_database
from app.core.time import utc_now
from app.core.validation import object_id_or_400
from app.schemas.common import serialize_doc

MAX_PAGE_SIZE = 100


def participant_key(users: list[str]) -> str:
    return ":".join(sorted(set(users)))


async def get_conversation_for_user(conversation_id: str, user_name: str) -> dict | None:
    if not ObjectId.is_valid(conversation_id):
        return None
    return await get_database().messages.find_one({"_id": ObjectId(conversation_id), "users": user_name})


async def get_conversation_users(conversation_id: str, user_name: str) -> list[str]:
    conversation = await get_conversation_for_user(conversation_id, user_name)
    return conversation.get("users", []) if conversation else []


async def unread_count(conversation: dict, user_name: str) -> int:
    read_by = conversation.get("readBy", {})
    last_read_at = read_by.get(user_name)
    query = {"conversation": conversation["_id"], "sender": {"$ne": user_name}}
    if last_read_at:
        query["createdAt"] = {"$gt": last_read_at}
    return await get_database().chatmessages.count_documents(query)


async def list_chats(current_user: dict) -> dict:
    db = get_database()
    user_name = current_user["name"]
    conversations = await db.messages.find(
        {"users": user_name, "group": False, "lastMessage": {"$exists": True}},
        {"users": 1, "updatedAt": 1, "lastMessage": 1, "readBy": 1},
    ).sort("updatedAt", -1).to_list(length=500)
    groups = await db.groups.find({"users": user_name}).sort("updatedAt", -1).to_list(length=500)
    group_chat_ids = [group["chatId"] for group in groups if group.get("chatId")]
    group_conversations = await db.messages.find(
        {"_id": {"$in": group_chat_ids}},
        {"updatedAt": 1, "lastMessage": 1, "readBy": 1},
    ).to_list(length=len(group_chat_ids))
    group_conversation_map = {str(conversation["_id"]): conversation for conversation in group_conversations}

    direct_chats = [
        {
            "chatId": conversation["_id"],
            "users": [name for name in conversation.get("users", []) if name != user_name],
            "updatedAt": conversation.get("updatedAt"),
            "lastMessage": conversation.get("lastMessage"),
            "group": False,
            "unreadCount": await unread_count(conversation, user_name),
        }
        for conversation in conversations
    ]

    group_chats = []
    for group in groups:
        conversation = group_conversation_map.get(str(group.get("chatId")))
        group_chats.append(
            {
                **group,
                "updatedAt": conversation.get("updatedAt") if conversation else group.get("updatedAt"),
                "lastMessage": conversation.get("lastMessage") if conversation else None,
                "unreadCount": await unread_count(conversation, user_name) if conversation else 0,
                "group": True,
            }
        )

    chats = sorted(
        [*direct_chats, *group_chats],
        key=lambda chat: chat.get("updatedAt") or datetime.min.replace(tzinfo=timezone.utc),
        reverse=True,
    )
    return {"status": 200, "message": "Chats", "chats": serialize_doc(chats), "user": user_name}


async def send_message(receiver: list[str], message: str, conversation_id: str | None, current_user: dict) -> dict:
    db = get_database()
    sender = current_user["name"]
    text = message.strip()
    if not text:
        raise HTTPException(status_code=400, detail="Message is required")

    conversation = await resolve_conversation(sender, receiver, conversation_id)
    now = utc_now()
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
        {"$set": {"lastMessage": {"message": text, "sender": sender, "createdAt": now}, "updatedAt": now}},
    )
    return {
        "status": 200,
        "statusMessage": "Message Added",
        "conversationId": str(conversation["_id"]),
        "recipients": [name for name in conversation["users"] if name != sender],
        "chatMessage": serialize_doc(chat_message),
        "message": {"messages": [serialize_doc(chat_message)]},
    }


async def resolve_conversation(sender: str, receiver: list[str], conversation_id: str | None) -> dict:
    if conversation_id:
        conversation = await get_conversation_for_user(conversation_id, sender)
        if not conversation:
            raise HTTPException(status_code=404, detail="Conversation not found")
        return conversation

    users = list(dict.fromkeys([sender, *receiver]))
    if len(users) != 2:
        raise HTTPException(status_code=400, detail="A direct conversation requires one recipient")

    db = get_database()
    key = participant_key(users)
    conversation = await db.messages.find_one({"group": False, "users": {"$all": users, "$size": len(users)}})
    if conversation:
        return conversation

    created_at = utc_now()
    return await db.messages.find_one_and_update(
        {"participantKey": key},
        {
            "$setOnInsert": {
                "users": users,
                "participantKey": key,
                "group": False,
                "messages": [],
                "readBy": {sender: created_at},
                "createdAt": created_at,
            }
        },
        upsert=True,
        return_document=ReturnDocument.AFTER,
    )


async def mark_read(conversation_id_value: str, current_user: dict) -> dict:
    conversation_id = object_id_or_400(conversation_id_value, "Invalid conversation id")
    result = await get_database().messages.update_one(
        {"_id": conversation_id, "users": current_user["name"]},
        {"$set": {f"readBy.{current_user['name']}": utc_now()}},
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Conversation not found")
    return {"status": 200, "message": "Conversation marked as read"}


async def get_direct_conversation(target_user_name: str, current_user: dict) -> dict:
    db = get_database()
    target = await db.users.find_one({"name": target_user_name}, {"name": 1})
    if not target:
        raise HTTPException(status_code=404, detail="User not found")
    if target["name"] == current_user["name"]:
        raise HTTPException(status_code=400, detail="Cannot start a chat with yourself")

    users = [current_user["name"], target["name"]]
    conversation = await db.messages.find_one(
        {"participantKey": participant_key(users), "group": False, "users": {"$all": users, "$size": len(users)}},
    )
    if not conversation or not conversation.get("lastMessage"):
        return {
            "status": 200,
            "message": "Direct conversation draft",
            "chat": None,
            "recipient": serialize_doc({"name": target["name"]}),
        }

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


async def list_followings(current_user: dict) -> dict:
    user = await get_database().users.find_one({"_id": current_user["_id"]}, {"followings": 1})
    return {"status": 200, "message": "Followings", "followings": serialize_doc([user] if user else [])}
