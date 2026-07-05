from datetime import datetime

from bson import ObjectId
from fastapi import HTTPException

from app.core.database import get_database
from app.schemas.common import serialize_doc
from app.services.conversation_service import get_conversation_for_user


async def list_messages(conversation_id: str, before: str | None, limit: int, current_user: dict) -> dict:
    conversation = await get_conversation_for_user(conversation_id, current_user["name"])
    if not conversation:
        raise HTTPException(status_code=404, detail="Conversation not found")

    legacy_cursor = legacy_message_cursor(before)
    current_messages = []
    if legacy_cursor is None:
        current_messages = await current_message_page(conversation["_id"], before, limit)

    has_more_current = len(current_messages) > limit
    page = list(reversed(current_messages[:limit]))
    legacy_page, has_more_legacy, next_legacy_cursor = legacy_message_page(conversation, legacy_cursor, limit - len(page), has_more_current)
    combined = [*legacy_page, *page]
    next_cursor = page[0].get("createdAt") if has_more_current and page else next_legacy_cursor

    return {
        "status": 200,
        "message": "Messages",
        "messages": {"_id": str(conversation["_id"]), "messages": serialize_doc(combined)},
        "pagination": {"hasMore": has_more_current or has_more_legacy, "nextCursor": serialize_doc(next_cursor)},
    }


def legacy_message_cursor(before: str | None) -> int | None:
    if before and before.startswith("legacy:"):
        return int(before.split(":", 1)[1])
    return None


async def current_message_page(conversation_id: ObjectId, before: str | None, limit: int) -> list[dict]:
    query: dict = {"conversation": conversation_id}
    if before:
        try:
            query["createdAt"] = {"$lt": datetime.fromisoformat(before.replace("Z", "+00:00"))}
        except ValueError:
            pass
    return await get_database().chatmessages.find(query).sort("createdAt", -1).limit(limit + 1).to_list(length=limit + 1)


def legacy_message_page(conversation: dict, legacy_cursor: int | None, remaining: int, has_more_current: bool) -> tuple[list[dict], bool, str | None]:
    legacy_messages = conversation.get("messages", [])
    legacy_end = len(legacy_messages) if legacy_cursor is None else min(max(legacy_cursor, 0), len(legacy_messages))
    legacy_start = max(0, legacy_end - remaining)
    legacy_page = []
    if not has_more_current and remaining > 0:
        legacy_page = [{**message, "conversation": conversation["_id"]} for message in legacy_messages[legacy_start:legacy_end]]

    has_more_legacy = not has_more_current and legacy_start > 0
    return legacy_page, has_more_legacy, f"legacy:{legacy_start}" if has_more_legacy else None
