from datetime import timedelta

from bson import ObjectId
from fastapi import WebSocket
from jose import JWTError, jwt

from app.core.config import get_settings
from app.core.database import get_database
from app.core.time import utc_now


def create_socket_ticket(user: dict) -> str:
    return jwt.encode(
        {"id": str(user["_id"]), "purpose": "chat-websocket", "exp": utc_now() + timedelta(seconds=60)},
        get_settings().secret_key,
        algorithm="HS256",
    )


async def authenticate_socket(websocket: WebSocket) -> dict | None:
    token = websocket.query_params.get("ticket")
    if not token:
        return None
    try:
        payload = jwt.decode(token, get_settings().secret_key, algorithms=["HS256"])
        user_id = payload.get("id")
        if payload.get("purpose") != "chat-websocket" or not user_id or not ObjectId.is_valid(user_id):
            return None
    except JWTError:
        return None
    return await get_database().users.find_one({"_id": ObjectId(user_id)}, {"password": 0})
