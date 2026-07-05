from fastapi import APIRouter, Depends
from pydantic import BaseModel, Field

from app.core.security import get_current_user
from app.services.group_service import create_group as create_group_service
from app.services.group_service import rename_group as rename_group_service

router = APIRouter()


class CreateGroupPayload(BaseModel):
    name: str = Field(default="", max_length=80)
    users: list[str] = Field(default_factory=list)


class RenameGroupPayload(BaseModel):
    chatId: str
    name: str = Field(default="", max_length=80)


@router.post("/createGroup")
async def create_group(payload: CreateGroupPayload, current_user: dict = Depends(get_current_user)) -> dict:
    return await create_group_service(payload.name, payload.users, current_user)


@router.post("/renameGroup")
async def rename_group(payload: RenameGroupPayload, current_user: dict = Depends(get_current_user)) -> dict:
    return await rename_group_service(payload.chatId, payload.name, current_user)
