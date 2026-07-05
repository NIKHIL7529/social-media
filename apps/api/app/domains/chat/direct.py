from fastapi import HTTPException
from pymongo import ReturnDocument

from app.core.database import get_database
from app.core.time import utc_now
from app.domains.chat.identity import get_conversation_for_user, participant_key
from app.domains.chat.read_keys import read_receipt_key
from app.schemas.common import serialize_doc


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
                "readBy": {read_receipt_key(sender): created_at},
                "createdAt": created_at,
            }
        },
        upsert=True,
        return_document=ReturnDocument.AFTER,
    )


async def get_direct_conversation(target_user_name: str, current_user: dict) -> dict:
    db = get_database()
    target = await db.users.find_one({"$or": [{"name": target_user_name}, {"username": target_user_name}]}, {"name": 1})
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
