from datetime import datetime

from bson import ObjectId
from fastapi import HTTPException

from app.core.database import get_database
from app.schemas.common import serialize_doc
from app.domains.chat.identity import get_conversation_for_user


async def list_messages(conversation_id: str, before: str | None, limit: int, current_user: dict) -> dict:
    conversation = await get_conversation_for_user(conversation_id, current_user["username"])
    if not conversation:
        raise HTTPException(status_code=404, detail="Conversation not found")

    messages = await current_message_page(conversation["_id"], before, limit)
    has_more = len(messages) > limit
    page = list(reversed(messages[:limit]))
    next_cursor = f"{serialize_doc(page[0]['createdAt'])}|{page[0]['_id']}" if has_more else None
    return {
        "status": 200,
        "message": "Messages",
        "messages": {"_id": str(conversation["_id"]), "messages": serialize_doc(page)},
        "pagination": {"hasMore": has_more, "nextCursor": next_cursor},
    }


async def current_message_page(conversation_id: ObjectId, before: str | None, limit: int) -> list[dict]:
    query: dict = {"conversation": conversation_id}
    if before:
        query.update(message_cursor_filter(before))
    return await get_database().chatmessages.find(query).sort([("createdAt", -1), ("_id", -1)]).limit(limit + 1).to_list(length=limit + 1)


def message_cursor_filter(before: str) -> dict:
    timestamp, separator, message_id = before.partition("|")
    try:
        created_at = datetime.fromisoformat(timestamp.replace("Z", "+00:00"))
        if not separator or not ObjectId.is_valid(message_id):
            raise ValueError
        return {"$or": [
            {"createdAt": {"$lt": created_at}},
            {"createdAt": created_at, "_id": {"$lt": ObjectId(message_id)}},
        ]}
    except ValueError as exc:
        raise HTTPException(status_code=400, detail="Invalid message cursor") from exc
