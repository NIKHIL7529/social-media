from bson import ObjectId

from app.core.database import get_database


def participant_key(users: list[str]) -> str:
    return ":".join(sorted(set(users)))


async def get_conversation_for_user(conversation_id: str, user_name: str) -> dict | None:
    if not ObjectId.is_valid(conversation_id):
        return None
    return await get_database().messages.find_one({"_id": ObjectId(conversation_id), "users": user_name})


async def get_conversation_users(conversation_id: str, user_name: str) -> list[str]:
    conversation = await get_conversation_for_user(conversation_id, user_name)
    return conversation.get("users", []) if conversation else []
