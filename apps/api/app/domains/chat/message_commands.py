from fastapi import HTTPException

from app.core.database import get_database
from app.core.time import utc_now
from app.domains.chat.direct import resolve_conversation
from app.domains.chat.read_keys import read_receipt_key
from app.schemas.common import serialize_doc


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
        {
            "$set": {
                "lastMessage": {"message": text, "sender": sender, "createdAt": now},
                f"readBy.{read_receipt_key(sender)}": now,
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
