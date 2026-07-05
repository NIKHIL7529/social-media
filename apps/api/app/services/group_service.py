from fastapi import HTTPException
from pymongo import ReturnDocument

from app.core.database import get_database
from app.core.time import utc_now
from app.core.validation import object_id_or_400
from app.schemas.common import serialize_doc


async def create_group(name: str, users: list[str], current_user: dict) -> dict:
    db = get_database()
    creator = current_user["name"]
    unique_users = list(dict.fromkeys([*users, creator]))
    if len(unique_users) < 2:
        raise HTTPException(status_code=400, detail="At least one member is required")

    now = utc_now()
    conversation = {
        "users": unique_users,
        "group": True,
        "messages": [],
        "readBy": {creator: now},
        "lastMessage": {"message": "Created Group", "sender": creator, "createdAt": now},
        "createdAt": now,
        "updatedAt": now,
    }
    conversation_result = await db.messages.insert_one(conversation)
    conversation["_id"] = conversation_result.inserted_id
    await db.chatmessages.insert_one(
        {
            "conversation": conversation["_id"],
            "sender": creator,
            "message": "Created Group",
            "type": "system",
            "createdAt": now,
            "updatedAt": now,
        }
    )
    group = {
        "creator": creator,
        "users": unique_users,
        "name": name.strip(),
        "chatId": conversation["_id"],
        "createdAt": now,
        "updatedAt": now,
    }
    group_result = await db.groups.insert_one(group)
    group["_id"] = group_result.inserted_id
    return {"status": 200, "message": "Group created", "addGroup": serialize_doc(group)}


async def rename_group(chat_id_value: str, name: str, current_user: dict) -> dict:
    chat_id = object_id_or_400(chat_id_value, "Chat id is required")
    group = await get_database().groups.find_one_and_update(
        {"chatId": chat_id, "users": current_user["name"]},
        {"$set": {"name": name.strip(), "updatedAt": utc_now()}},
        return_document=ReturnDocument.AFTER,
    )
    if not group:
        raise HTTPException(status_code=404, detail="Group not found")
    return {"status": 200, "message": "Group renamed", "group": serialize_doc(group)}
