from fastapi import HTTPException

from app.core.database import get_database
from app.core.time import utc_now
from app.core.validation import object_id_or_400
from app.domains.chat.read_keys import read_receipt_key


async def unread_count(conversation: dict, user_name: str) -> int:
    counts = await unread_counts([conversation], user_name)
    return counts.get(conversation["_id"], 0)


async def unread_counts(conversations: list[dict], user_name: str) -> dict:
    """Count unread messages for a chat list in one database round trip."""
    conditions = []
    for conversation in {item["_id"]: item for item in conversations}.values():
        read_by = conversation.get("readBy", {})
        last_read_at = read_by.get(read_receipt_key(user_name)) or read_by.get(user_name)
        condition = {"conversation": conversation["_id"]}
        if last_read_at:
            condition["createdAt"] = {"$gt": last_read_at}
        conditions.append(condition)
    if not conditions:
        return {}
    rows = await get_database().chatmessages.aggregate([
        {"$match": {
            "$or": conditions,
            "sender": {"$ne": user_name},
            "type": {"$ne": "system"},
        }},
        {"$group": {"_id": "$conversation", "count": {"$sum": 1}}},
    ]).to_list(length=len(conditions))
    return {row["_id"]: row["count"] for row in rows}


async def mark_read(conversation_id_value: str, current_user: dict) -> dict:
    conversation_id = object_id_or_400(conversation_id_value, "Invalid conversation id")
    result = await get_database().messages.update_one(
        {"_id": conversation_id, "users": current_user["name"]},
        {"$set": {f"readBy.{read_receipt_key(current_user['name'])}": utc_now()}},
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Conversation not found")
    return {"status": 200, "message": "Conversation marked as read"}
