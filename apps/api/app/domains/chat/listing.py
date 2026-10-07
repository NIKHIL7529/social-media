import asyncio
from datetime import datetime, timezone

from app.core.database import get_database
from app.domains.chat.read_state import unread_counts
from app.schemas.common import serialize_doc


async def list_chats(current_user: dict) -> dict:
    db = get_database()
    user_name = current_user["name"]
    conversations, groups = await asyncio.gather(
        db.messages.find(
            {"users": user_name, "group": False, "lastMessage": {"$exists": True}},
            {"users": 1, "updatedAt": 1, "lastMessage": 1, "readBy": 1},
        ).sort("updatedAt", -1).to_list(length=500),
        db.groups.find({"users": user_name}).sort("updatedAt", -1).to_list(length=500),
    )
    group_chat_ids = [group["chatId"] for group in groups if group.get("chatId")]
    group_conversations = await db.messages.find(
        {"_id": {"$in": group_chat_ids}},
        {"updatedAt": 1, "lastMessage": 1, "readBy": 1},
    ).to_list(length=len(group_chat_ids)) if group_chat_ids else []
    group_conversation_map = {str(conversation["_id"]): conversation for conversation in group_conversations}
    counts = await unread_counts([*conversations, *group_conversations], user_name)

    direct_chats = [
        {
            "chatId": conversation["_id"],
            "users": [name for name in conversation.get("users", []) if name != user_name],
            "updatedAt": conversation.get("updatedAt"),
            "lastMessage": conversation.get("lastMessage"),
            "group": False,
            "unreadCount": counts.get(conversation["_id"], 0),
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
                "unreadCount": counts.get(conversation["_id"], 0) if conversation else 0,
                "group": True,
            }
        )

    chats = sorted(
        [*direct_chats, *group_chats],
        key=lambda chat: chat.get("updatedAt") or datetime.min.replace(tzinfo=timezone.utc),
        reverse=True,
    )
    return {"status": 200, "message": "Chats", "chats": serialize_doc(chats), "user": user_name}


async def list_followings(current_user: dict) -> dict:
    user = await get_database().users.find_one({"_id": current_user["_id"]}, {"followings": 1})
    return {"status": 200, "message": "Followings", "followings": serialize_doc([user] if user else [])}
