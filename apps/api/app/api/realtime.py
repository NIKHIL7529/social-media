from bson import ObjectId
from fastapi import APIRouter, WebSocket, WebSocketDisconnect, status
from jose import JWTError, jwt

from app.core.config import get_settings
from app.core.database import get_database
from app.schemas.common import serialize_doc
from app.services.realtime import realtime_manager

router = APIRouter()


async def authenticate_socket(websocket: WebSocket) -> dict | None:
    token = websocket.cookies.get("token")
    if not token:
        return None
    try:
        payload = jwt.decode(token, get_settings().secret_key, algorithms=["HS256"])
        user_id = payload.get("id")
        if not user_id or not ObjectId.is_valid(user_id):
            return None
    except JWTError:
        return None
    return await get_database().users.find_one({"_id": ObjectId(user_id)}, {"password": 0})


async def get_conversation_users(chat_id: str, user_name: str) -> list[str]:
    if not ObjectId.is_valid(chat_id):
        return []
    conversation = await get_database().messages.find_one(
        {"_id": ObjectId(chat_id), "users": user_name},
        {"users": 1},
    )
    return conversation.get("users", []) if conversation else []


@router.websocket("/ws/chat")
async def chat_socket(websocket: WebSocket) -> None:
    user = await authenticate_socket(websocket)
    if not user:
        await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
        return

    user_name = user["name"]
    await realtime_manager.connect(websocket, user_name)
    await realtime_manager.broadcast_online_users()

    try:
        while True:
            data = await websocket.receive_json()
            event_type = data.get("type")
            chat_id = data.get("chatId")

            if event_type in {"message", "typing"}:
                recipients = await get_conversation_users(chat_id, user_name)
                if not recipients:
                    continue

                payload = {
                    **data,
                    "sender": user_name,
                }
                if event_type == "message" and data.get("message"):
                    payload["message"] = serialize_doc(data["message"])

                for recipient in recipients:
                    await realtime_manager.send_to_user(recipient, payload)

            if event_type == "group":
                users = data.get("users") or []
                for recipient in users:
                    await realtime_manager.send_to_user(recipient, {**data, "sender": user_name})

    except (WebSocketDisconnect, asyncio.CancelledError):
        realtime_manager.disconnect(websocket)
        try:
            await realtime_manager.broadcast_online_users()
        except Exception:
            pass
import asyncio
