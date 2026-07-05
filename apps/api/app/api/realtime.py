import asyncio

from fastapi import APIRouter, WebSocket, WebSocketDisconnect, status

from app.schemas.common import serialize_doc
from app.domains.chat import authenticate_socket, get_conversation_users, realtime_manager

router = APIRouter()


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
                recipients = await get_conversation_users(chat_id or "", user_name)
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
