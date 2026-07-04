from datetime import datetime, timezone

from bson import ObjectId
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from pymongo import ReturnDocument

from app.core.database import get_database
from app.core.security import get_current_user
from app.schemas.common import serialize_doc

router = APIRouter()


class CreateGroupPayload(BaseModel):
    name: str = Field(default="", max_length=80)
    users: list[str] = Field(default_factory=list)


class RenameGroupPayload(BaseModel):
    chatId: str
    name: str = Field(default="", max_length=80)


@router.post("/createGroup")
async def create_group(payload: CreateGroupPayload, current_user: dict = Depends(get_current_user)) -> dict:
    db = get_database()
    creator = current_user["name"]
    name = payload.name.strip()
    users = list(dict.fromkeys([*payload.users, creator]))
    if len(users) < 2:
        raise HTTPException(status_code=400, detail="At least one member is required")

    now = datetime.now(timezone.utc)
    conversation = {
        "users": users,
        "group": True,
        "messages": [],
        "readBy": {creator: now},
        "lastMessage": {"message": "Created Group", "sender": creator, "createdAt": now},
        "createdAt": now,
        "updatedAt": now,
    }
    conversation_result = await db.messages.insert_one(conversation)
    conversation["_id"] = conversation_result.inserted_id
    await db.chatmessages.insert_one(
        {
            "conversation": conversation["_id"],
            "sender": creator,
            "message": "Created Group",
            "type": "system",
            "createdAt": now,
            "updatedAt": now,
        }
    )
    group = {
        "creator": creator,
        "users": users,
        "name": name,
        "chatId": conversation["_id"],
        "createdAt": now,
        "updatedAt": now,
    }
    group_result = await db.groups.insert_one(group)
    group["_id"] = group_result.inserted_id
    return {"status": 200, "message": "Group created", "addGroup": serialize_doc(group)}


@router.post("/renameGroup")
async def rename_group(payload: RenameGroupPayload, current_user: dict = Depends(get_current_user)) -> dict:
    if not ObjectId.is_valid(payload.chatId):
        raise HTTPException(status_code=400, detail="Chat id is required")
    group = await get_database().groups.find_one_and_update(
        {"chatId": ObjectId(payload.chatId), "users": current_user["name"]},
        {"$set": {"name": payload.name.strip(), "updatedAt": datetime.now(timezone.utc)}},
        return_document=ReturnDocument.AFTER,
    )
    if not group:
        raise HTTPException(status_code=404, detail="Group not found")
    return {"status": 200, "message": "Group renamed", "group": serialize_doc(group)}
