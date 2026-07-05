from app.core.database import get_database
from app.core.time import utc_now
from app.schemas.common import serialize_doc


async def create_notification(
    recipient: str,
    actor: str,
    notification_type: str,
    entity_id: str,
    text: str,
) -> None:
    if not recipient or recipient == actor:
        return
    now = utc_now()
    await get_database().notifications.insert_one(
        {
            "recipient": recipient,
            "actor": actor,
            "type": notification_type,
            "entityId": entity_id,
            "text": text,
            "read": False,
            "createdAt": now,
            "updatedAt": now,
        }
    )


async def list_notifications(current_user: dict, limit: int = 50) -> dict:
    docs = await get_database().notifications.find({"recipient": current_user["name"]}).sort("createdAt", -1).limit(limit).to_list(length=limit)
    unread = await get_database().notifications.count_documents({"recipient": current_user["name"], "read": False})
    return {"status": 200, "notifications": serialize_doc(docs), "unread": unread}


async def mark_notifications_read(current_user: dict) -> dict:
    await get_database().notifications.update_many(
        {"recipient": current_user["name"], "read": False},
        {"$set": {"read": True, "updatedAt": utc_now()}},
    )
    return {"status": 200, "message": "Notifications marked as read"}
