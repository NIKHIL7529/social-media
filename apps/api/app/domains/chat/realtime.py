import asyncio
from collections import defaultdict
from typing import Any

from fastapi import WebSocket, WebSocketDisconnect


class RealtimeConnectionManager:
    def __init__(self) -> None:
        self._connections_by_user: dict[str, set[WebSocket]] = defaultdict(set)
        self._user_by_socket: dict[WebSocket, str] = {}

    async def connect(self, websocket: WebSocket, user_name: str) -> None:
        await websocket.accept()
        self._connections_by_user[user_name].add(websocket)
        self._user_by_socket[websocket] = user_name

    def disconnect(self, websocket: WebSocket) -> str | None:
        user_name = self._user_by_socket.pop(websocket, None)
        if not user_name:
            return None
        connections = self._connections_by_user.get(user_name)
        if connections:
            connections.discard(websocket)
            if not connections:
                self._connections_by_user.pop(user_name, None)
        return user_name

    def online_users(self) -> list[dict[str, str]]:
        return [{"user": user_name} for user_name in sorted(self._connections_by_user)]

    async def send_to_user(self, user_name: str, payload: dict[str, Any]) -> None:
        stale_connections: list[WebSocket] = []
        for websocket in self._connections_by_user.get(user_name, set()).copy():
            try:
                await websocket.send_json(payload)
            except (RuntimeError, WebSocketDisconnect, OSError, asyncio.CancelledError):
                stale_connections.append(websocket)
            except Exception:
                stale_connections.append(websocket)
        for websocket in stale_connections:
            self.disconnect(websocket)

    async def broadcast_online_users(self) -> None:
        await self.broadcast({"type": "online_users", "users": self.online_users()})

    async def broadcast(self, payload: dict[str, Any]) -> None:
        for user_name in list(self._connections_by_user):
            await self.send_to_user(user_name, payload)


realtime_manager = RealtimeConnectionManager()
